#!/bin/sh
set -eu

escape_js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

api_url=$(escape_js_string "${VITE_API_URL:-/api/v1}")
ws_url=$(escape_js_string "${VITE_WS_URL:-}")

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "$api_url",
  VITE_WS_URL: "$ws_url"
};
EOF

if ! grep -q '/env.js' /usr/share/nginx/html/index.html; then
  sed -i 's#</head>#  <script src="/env.js"></script>\n</head>#' /usr/share/nginx/html/index.html
fi

exec "$@"
