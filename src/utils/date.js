export const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

export const shortTime = (d) =>
  new Date(d).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });

export const longDate = (d) =>
  new Date(d).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
