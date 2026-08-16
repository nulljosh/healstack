#!/usr/bin/env bash
# Guards the exact failure that got Healstack rejected under Guideline 2.1(a)
# ("Unable to log in", 2026-08-05).
#
# Root cause was NOT the app: the App Review demo account's row in auth.users on the
# shared `spark` Supabase project had `email_change`/`email_change_token_new` set to NULL.
# GoTrue scans those columns into non-nullable Go strings, so every auth call touching
# that one row threw a 500 ("Database error querying schema") instead of a normal 400.
# The reviewer typed the credentials we gave them and got a server error.
#
# A healthy row answers a wrong password with 400 invalid_credentials.
# A corrupt row answers with 500. That difference is the whole test.
#
# Run before any resubmit. Exits non-zero if the backend would reject a reviewer again.

set -euo pipefail

SUPABASE_URL="https://tjsxsqlxjmanwvmywwvw.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqc3hzcWx4am1hbnd2bXl3d3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc0MDEsImV4cCI6MjA4NjA3MzQwMX0.LphLfho3wdQC20MhtcnBpzQUNuBoTOobrugQbNGxc68"
DEMO_EMAIL="healstack.demo@heyitsmejosh.com"

fail=0

probe() { # $1=label $2=email $3=password -> echoes HTTP status
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$2\",\"password\":\"$3\"}"
}

# 1. The anon key the app ships must still be accepted. A rotated JWT secret would
#    break every sign-in with no app-side change.
health=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/auth/v1/health" -H "apikey: $ANON_KEY")
if [ "$health" = "200" ]; then
  echo "ok   anon key accepted (health $health)"
else
  echo "FAIL anon key rejected (health $health) — the shipped SUPABASE_ANON_KEY is stale"
  fail=1
fi

# 2. The demo row must not be in the 500 state. Deliberately wrong password:
#    we are testing the row's health, not the credential.
code=$(probe demo "$DEMO_EMAIL" "deliberately-wrong-probe-not-a-real-password")
case "$code" in
  400) echo "ok   demo row healthy (400 invalid_credentials on a wrong password)" ;;
  500) echo "FAIL demo row is back in the 500 state — App Review will see 'unable to log in'"
       echo "     fix: update auth.users set email_change = coalesce(email_change, ''),"
       echo "          email_change_token_new = coalesce(email_change_token_new, '')"
       echo "          where email = '$DEMO_EMAIL';"
       fail=1 ;;
  *)   echo "FAIL demo row returned unexpected $code (expected 400)"; fail=1 ;;
esac

# 3. Optional end-to-end: only runs when the real demo password is supplied, since it
#    is not stored in the repo. This is the one check that proves a reviewer can get in.
if [ -n "${HEALSTACK_DEMO_PASSWORD:-}" ]; then
  code=$(probe real "$DEMO_EMAIL" "$HEALSTACK_DEMO_PASSWORD")
  if [ "$code" = "200" ]; then
    echo "ok   demo credentials sign in (200 with a session)"
  else
    echo "FAIL demo credentials do not sign in ($code) — reviewer would be blocked"
    fail=1
  fi
else
  echo "skip demo sign-in — set HEALSTACK_DEMO_PASSWORD to verify the ASC credentials work"
fi

[ "$fail" -eq 0 ] && echo "PASS auth backend is in a reviewable state" || echo "FAILED — do not resubmit"
exit "$fail"
