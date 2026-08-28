#!/usr/bin/env bash
# Guards the six ways Sign in with Apple / Google have silently broken before.
#
# The consent sheets themselves cannot be automated — Apple's is drawn by a separate
# system process behind a Touch ID gate, Google's runs in ASWebAuthenticationSession.
# But the sheet has never been the bug. Every failure on 2026-08-28 was static config:
#
#   - litigate macOS silently lost com.apple.security.app-sandbox and network.client
#     because a duplicate `entitlements:` key in project.yml meant the last block won.
#     Would have failed Mac App Store validation and killed all networking at runtime.
#   - healstack macOS shipped with no CFBundleURLSchemes: the plist was hand-edited, and
#     xcodegen regenerates it from project.yml on every generate. Build still succeeded.
#   - lexly's bundle ID was missing from Supabase external_apple_client_id.
#   - an entitlement present in project.yml but absent from the signed binary (this is
#     why every check below reads the BUILT artifact, never the source).
#
# Usage: scripts/check-signin-config.sh <healstack|litigate|lexly> [--platform macos|ios]
# Exits non-zero if any invariant is broken.

set -uo pipefail

APP="${1:?usage: check-signin-config.sh <healstack|litigate|lexly>}"
CODE_ROOT="${CODE_ROOT:-$HOME/Documents/Code}"
PROJECT_REF="tjsxsqlxjmanwvmywwvw"
EXPECTED_SITE_URL="https://spark.heyitsmejosh.com"

case "$APP" in
  healstack) BUNDLE="com.heyitsmejosh.dose";  SCHEME="healstack"; APPNAME="Healstack" ;;
  litigate)  BUNDLE="com.nulljosh.brief";     SCHEME="litigate";  APPNAME="Litigate"  ;;
  lexly)     BUNDLE="com.nulljosh.lingo";     SCHEME="lexly";     APPNAME="Lingo-macOS" ;;
  *) echo "unknown app '$APP' (expected healstack|litigate|lexly)"; exit 2 ;;
esac

fail=0
note() { echo "ok   $1"; }
bad()  { echo "FAIL $1"; fail=1; }

echo "== $APP ($BUNDLE) =="

# --- built artifact checks -------------------------------------------------------
# Newest matching .app under DerivedData. Deliberately the built product: checking
# project.yml is exactly what let two bugs through.
APP_PATH=$(find "$HOME/Library/Developer/Xcode/DerivedData" \
             -path "*/Build/Products/Debug/$APPNAME.app" -maxdepth 5 -type d 2>/dev/null \
           | xargs -I{} stat -f "%m %N" {} 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$APP_PATH" ]; then
  bad "no built $APPNAME.app found — build it first, these checks read the binary not the yml"
else
  note "using $(basename "$APP_PATH") built $(stat -f '%Sm' "$APP_PATH")"

  # ponytail: no mtime-vs-project.yml staleness check. An incremental build that
  # relinks nothing leaves the .app directory's mtime untouched, so the comparison
  # false-alarms on an up-to-date build — and a check that cries wolf gets ignored.
  # The checks below read the artifact's CONTENTS, which is the real guarantee anyway.

  ENT=$(codesign -d --entitlements - "$APP_PATH" 2>/dev/null)
  echo "$ENT" | grep -q "com.apple.developer.applesignin" \
    && note "applesignin entitlement present in the SIGNED binary" \
    || bad "applesignin MISSING from the signed binary (project.yml may still claim it)"

  # macOS only: a duplicate entitlements: key drops these without failing the build.
  if [[ "$APP_PATH" == *"/Debug/"* ]] && [[ "$APP_PATH" != *"iphone"* ]]; then
    if echo "$ENT" | grep -q "app-sandbox"; then
      note "app-sandbox retained"
      echo "$ENT" | grep -q "network.client" \
        && note "network.client retained" \
        || bad "network.client GONE — all networking will fail at runtime"
    fi
  fi

  PLIST="$APP_PATH/Contents/Info.plist"
  [ -f "$PLIST" ] || PLIST="$APP_PATH/Info.plist"
  if /usr/libexec/PlistBuddy -c "Print :CFBundleURLTypes" "$PLIST" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Print :CFBundleURLTypes" "$PLIST" 2>/dev/null | grep -q "$SCHEME" \
      && note "URL scheme '$SCHEME' in the BUILT Info.plist" \
      || bad "scheme '$SCHEME' missing from the built plist — OAuth callback lands nowhere"
  else
    bad "no CFBundleURLTypes in the built plist (xcodegen may have regenerated over it)"
  fi
fi

# --- live Supabase checks --------------------------------------------------------
PAT=$(security find-generic-password -s "Supabase CLI" -w 2>/dev/null)
if [ -z "$PAT" ]; then
  echo "skip Supabase checks — no Management PAT in the keychain"
else
  CFG=$(curl -s "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
          -H "Authorization: Bearer $PAT")

  get() { echo "$CFG" | python3 -c "import sys,json;print(json.load(sys.stdin).get('$1') or '')"; }

  [ "$(get external_apple_enabled)" = "True" ] \
    && note "apple provider enabled" || bad "apple provider DISABLED"

  echo "$(get external_apple_client_id)" | tr ',' '\n' | grep -qx "$BUNDLE" \
    && note "$BUNDLE registered in external_apple_client_id" \
    || bad "$BUNDLE NOT in external_apple_client_id — native Apple sign-in cannot work"

  echo "$(get uri_allow_list)" | tr ',' '\n' | grep -q "^$SCHEME://" \
    && note "$SCHEME:// in uri_allow_list" \
    || bad "$SCHEME:// NOT in uri_allow_list — Google callback will be rejected"

  # A past PATCH clobbered site_url and nearly broke another app's reset emails.
  [ "$(get site_url)" = "$EXPECTED_SITE_URL" ] \
    && note "site_url intact" \
    || bad "site_url is '$(get site_url)', expected $EXPECTED_SITE_URL"

  GOOG=$(curl -s -o /dev/null -w "%{http_code}" \
           "https://$PROJECT_REF.supabase.co/auth/v1/authorize?provider=google")
  [ "$GOOG" = "302" ] \
    && note "google authorize 302s (credentials live)" \
    || bad "google authorize returned $GOOG, expected 302"
fi

echo
[ "$fail" -eq 0 ] && echo "PASS $APP sign-in config is sound" || echo "FAILED — $APP sign-in would break"
exit "$fail"
