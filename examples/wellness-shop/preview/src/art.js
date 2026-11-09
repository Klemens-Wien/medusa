/* Product illustrations, drawn as SVG so they always load instantly and
 * can be recoloured per variant. Exposes window.VermontArt. */
;(function () {
  var uid = 0

  function hexToRgb(hex) {
    var h = hex.replace("#", "")
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  function mix(hex, target, amount) {
    var a = hexToRgb(hex), b = hexToRgb(target)
    var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * amount) })
    return "#" + c.map(function (v) { return ("0" + v.toString(16)).slice(-2) }).join("")
  }
  function light(hex, n) { return mix(hex, "#ffffff", n) }
  function dark(hex, n) { return mix(hex, "#0b0814", n) }

  // Deterministic pseudo random, so drawings look the same every render
  function rng(seed) {
    var s = seed
    return function () {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }

  function defs(id, c) {
    return (
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + light(c, 0.45) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + dark(c, 0.45) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + light(c, 0.4) + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + dark(c, 0.5) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + dark(c, 0.45) + '"/><stop offset=".3" stop-color="' + light(c, 0.35) + '"/><stop offset=".6" stop-color="' + c + '"/><stop offset="1" stop-color="' + dark(c, 0.5) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="' + light(c, 0.55) + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + dark(c, 0.55) + '"/></radialGradient>' +
      '<radialGradient id="' + id + 's"><stop offset="0" stop-color="#05030a" stop-opacity=".55"/><stop offset="1" stop-color="#05030a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".25" stop-color="#fff" stop-opacity=".45"/><stop offset=".4" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d8a96"/><stop offset=".35" stop-color="#f4f2f8"/><stop offset=".6" stop-color="#b9b5c4"/><stop offset="1" stop-color="#6d6978"/></linearGradient>' +
      '<linearGradient id="' + id + 'gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c7a3c"/><stop offset=".35" stop-color="#f7e2a8"/><stop offset=".6" stop-color="#d1aa5a"/><stop offset="1" stop-color="#7d5f2a"/></linearGradient>' +
      '<filter id="' + id + 'blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
      '<filter id="' + id + 'soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>'
    )
  }

  function shadow(id, cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + id + 's)"/>'
  }

  var DRAW = {
    "massage-gun": function (id, c) {
      return shadow(id, 200, 420, 120, 20) +
        '<g transform="rotate(-10 200 260)">' +
        '<rect x="168" y="235" width="66" height="175" rx="28" fill="url(#' + id + 'h)"/>' +
        '<rect x="176" y="250" width="10" height="140" rx="5" fill="#fff" opacity=".18"/>' +
        '<circle cx="201" cy="300" r="9" fill="' + dark(c, 0.6) + '"/><circle cx="201" cy="300" r="5" fill="#d6ff3f"/>' +
        '<rect x="68" y="190" width="70" height="52" rx="14" fill="' + dark(c, 0.35) + '"/>' +
        '<rect x="68" y="190" width="70" height="14" rx="7" fill="#fff" opacity=".12"/>' +
        '<circle cx="62" cy="216" r="40" fill="url(#' + id + 'r)"/>' +
        '<circle cx="62" cy="216" r="40" fill="#fff" opacity=".08"/>' +
        '<ellipse cx="50" cy="200" rx="14" ry="9" fill="#fff" opacity=".35"/>' +
        '<rect x="112" y="152" width="236" height="114" rx="57" fill="url(#' + id + 'b)"/>' +
        '<path d="M150 170 H310 a30 30 0 0 1 22 10" stroke="#fff" stroke-opacity=".4" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<g fill="' + dark(c, 0.55) + '"><rect x="300" y="186" width="30" height="7" rx="3.5"/><rect x="300" y="202" width="34" height="7" rx="3.5"/><rect x="300" y="218" width="30" height="7" rx="3.5"/><rect x="300" y="234" width="24" height="7" rx="3.5"/></g>' +
        '<circle cx="242" cy="209" r="16" fill="' + dark(c, 0.5) + '"/><circle cx="242" cy="209" r="16" fill="none" stroke="#d6ff3f" stroke-width="3" stroke-dasharray="60 40" opacity=".9"/>' +
        "</g>"
    },

    neck: function (id, c) {
      var knobs = ""
      ;[[132, 252], [150, 300], [250, 300], [268, 252]].forEach(function (k) {
        knobs += '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="20" fill="' + dark(c, 0.25) + '"/><circle cx="' + (k[0] - 5) + '" cy="' + (k[1] - 6) + '" r="7" fill="#fff" opacity=".35"/>'
      })
      return shadow(id, 200, 415, 135, 20) +
        '<path d="M88 190 C88 400 312 400 312 190" stroke="' + dark(c, 0.35) + '" stroke-width="86" fill="none" stroke-linecap="round"/>' +
        '<path d="M88 190 C88 395 312 395 312 190" stroke="url(#' + id + 'v)" stroke-width="74" fill="none" stroke-linecap="round"/>' +
        '<path d="M70 200 C74 330 140 372 200 372" stroke="#fff" stroke-opacity=".25" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M120 205 C124 320 160 336 200 336 C240 336 276 320 280 205" stroke="' + dark(c, 0.55) + '" stroke-width="18" fill="none" stroke-linecap="round" opacity=".55"/>' +
        knobs +
        '<rect x="56" y="128" width="64" height="40" rx="20" fill="none" stroke="' + dark(c, 0.3) + '" stroke-width="12"/>' +
        '<rect x="280" y="128" width="64" height="40" rx="20" fill="none" stroke="' + dark(c, 0.3) + '" stroke-width="12"/>' +
        '<circle cx="200" cy="384" r="10" fill="#d6ff3f" opacity=".9"/>'
    },

    guasha: function (id, c) {
      return shadow(id, 205, 410, 120, 18) +
        '<g transform="rotate(-8 210 280)">' +
        '<path d="M110 300 C104 210 190 166 236 214 C262 240 292 214 300 170 C346 232 336 340 232 372 C164 392 114 360 110 300 Z" fill="' + dark(c, 0.3) + '" transform="translate(6 10)"/>' +
        '<path d="M110 300 C104 210 190 166 236 214 C262 240 292 214 300 170 C346 232 336 340 232 372 C164 392 114 360 110 300 Z" fill="url(#' + id + 'b)"/>' +
        '<path d="M130 290 C130 230 186 204 222 236" stroke="#fff" stroke-opacity=".6" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M160 330 C200 300 240 320 290 260" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none"/>' +
        '<path d="M150 350 C190 340 220 350 260 330" stroke="' + dark(c, 0.3) + '" stroke-opacity=".35" stroke-width="2" fill="none"/>' +
        '<ellipse cx="300" cy="200" rx="6" ry="14" fill="#fff" opacity=".55" transform="rotate(30 300 200)"/>' +
        "</g>" +
        '<path d="M318 140 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6z" fill="#fff" opacity=".85"/>'
    },

    roller: function (id, c) {
      return shadow(id, 205, 420, 110, 16) +
        '<g transform="rotate(14 200 290)">' +
        '<path d="M128 206 H112 V240 Q112 262 200 268 Q288 262 288 240 V206 H272" stroke="url(#' + id + 'gold)" stroke-width="8" fill="none" stroke-linejoin="round"/>' +
        '<rect x="194" y="262" width="12" height="40" fill="url(#' + id + 'gold)"/>' +
        '<rect x="128" y="172" width="144" height="68" rx="30" fill="url(#' + id + 'v)"/>' +
        '<rect x="140" y="182" width="120" height="12" rx="6" fill="#fff" opacity=".35"/>' +
        '<rect x="180" y="296" width="40" height="120" rx="20" fill="url(#' + id + 'h)"/>' +
        '<rect x="188" y="306" width="7" height="96" rx="3.5" fill="#fff" opacity=".3"/>' +
        '<path d="M176 412 H168 V432 Q168 440 200 442 Q232 440 232 432 V412 H224" stroke="url(#' + id + 'gold)" stroke-width="6" fill="none"/>' +
        '<rect x="174" y="440" width="52" height="30" rx="14" fill="url(#' + id + 'v)"/>' +
        "</g>"
    },

    dropper: function (id, c) {
      var amber = "#9a5a22"
      return shadow(id, 200, 412, 92, 16) +
        '<rect x="182" y="78" width="36" height="76" rx="18" fill="#2b2733"/><rect x="188" y="86" width="8" height="54" rx="4" fill="#fff" opacity=".2"/>' +
        '<rect x="168" y="146" width="64" height="52" rx="10" fill="url(#' + id + 'm)"/>' +
        '<rect x="176" y="192" width="48" height="28" fill="' + dark(amber, 0.2) + '"/>' +
        '<path d="M176 218 C150 224 140 238 140 262 V376 Q140 404 168 404 H232 Q260 404 260 376 V262 C260 238 250 224 224 218 Z" fill="' + amber + '"/>' +
        '<path d="M176 218 C150 224 140 238 140 262 V376 Q140 404 168 404 H232 Q260 404 260 376 V262 C260 238 250 224 224 218 Z" fill="url(#' + id + 'g)"/>' +
        '<rect x="152" y="282" width="96" height="88" rx="8" fill="' + light(c, 0.15) + '"/>' +
        '<rect x="166" y="300" width="68" height="10" rx="5" fill="' + dark(c, 0.55) + '"/>' +
        '<rect x="176" y="320" width="48" height="6" rx="3" fill="' + dark(c, 0.35) + '"/>' +
        '<circle cx="200" cy="348" r="9" fill="none" stroke="' + dark(c, 0.45) + '" stroke-width="3"/>' +
        '<path d="M300 250 C300 250 284 272 284 282 a16 16 0 0 0 32 0 C316 272 300 250 300 250Z" fill="' + c + '"/>' +
        '<ellipse cx="294" cy="282" rx="4" ry="7" fill="#fff" opacity=".6"/>'
    },

    diffuser: function (id, c) {
      return shadow(id, 200, 416, 120, 18) +
        '<ellipse cx="200" cy="392" rx="110" ry="30" fill="#ff5fd2" opacity=".55" filter="url(#' + id + 'blur)"/>' +
        '<g fill="none" stroke="#fff" stroke-linecap="round" filter="url(#' + id + 'soft)">' +
        '<path d="M200 168 C180 140 222 120 200 92 C184 72 214 56 204 36" stroke-width="10" opacity=".45"/>' +
        '<path d="M212 160 C236 136 214 112 236 88" stroke-width="7" opacity=".3"/>' +
        '<path d="M190 160 C166 140 184 116 168 96" stroke-width="6" opacity=".25"/></g>' +
        '<path d="M200 164 C268 164 302 300 294 356 C290 388 110 388 106 356 C98 300 132 164 200 164Z" fill="url(#' + id + 'b)"/>' +
        '<path d="M170 190 C146 230 130 300 134 340" stroke="#fff" stroke-opacity=".45" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="200" cy="172" rx="16" ry="6" fill="' + dark(c, 0.55) + '"/>' +
        '<path d="M108 346 C150 362 250 362 292 346 L296 368 C250 392 150 392 104 368Z" fill="' + dark(c, 0.3) + '"/>' +
        '<ellipse cx="200" cy="372" rx="96" ry="8" fill="#ffb38a" opacity=".55"/>' +
        '<circle cx="200" cy="300" r="7" fill="#d6ff3f"/>'
    },

    yogamat: function (id, c) {
      var r = rng(7), dots = ""
      for (var i = 0; i < 70; i++) {
        dots += '<circle cx="' + (150 + r() * 175).toFixed(1) + '" cy="' + (246 + r() * 108).toFixed(1) + '" r="' + (1 + r() * 1.6).toFixed(1) + '" fill="' + dark(c, 0.35) + '" opacity=".5"/>'
      }
      var spiral = ""
      for (var k = 0; k < 5; k++) {
        spiral += '<ellipse cx="140" cy="300" rx="' + (24 - k * 4.4) + '" ry="' + (60 - k * 11) + '" fill="none" stroke="' + dark(c, 0.25 + k * 0.06) + '" stroke-width="3"/>'
      }
      return shadow(id, 230, 380, 150, 18) +
        '<rect x="140" y="240" width="190" height="120" fill="url(#' + id + 'v)"/>' + dots +
        '<rect x="150" y="250" width="170" height="10" rx="5" fill="#fff" opacity=".25"/>' +
        '<ellipse cx="330" cy="300" rx="24" ry="60" fill="' + dark(c, 0.3) + '"/>' +
        '<ellipse cx="140" cy="300" rx="26" ry="60" fill="' + light(c, 0.2) + '"/>' + spiral +
        '<rect x="188" y="236" width="20" height="128" rx="4" fill="#2b2733"/>' +
        '<rect x="276" y="236" width="20" height="128" rx="4" fill="#2b2733"/>' +
        '<path d="M198 236 C210 170 286 170 286 236" stroke="#2b2733" stroke-width="10" fill="none"/>'
    },

    foamroller: function (id, c) {
      var blocks = ""
      for (var x = 0; x < 6; x++) {
        for (var y = 0; y < 4; y++) {
          blocks += '<rect x="' + (128 + x * 30 + (y % 2) * 12) + '" y="' + (244 + y * 28) + '" width="18" height="16" rx="5" fill="' + dark(c, 0.25) + '" opacity=".55"/>'
        }
      }
      return shadow(id, 220, 390, 140, 18) +
        '<rect x="120" y="234" width="200" height="124" fill="url(#' + id + 'v)"/>' + blocks +
        '<rect x="128" y="244" width="184" height="9" rx="4.5" fill="#fff" opacity=".35"/>' +
        '<ellipse cx="320" cy="296" rx="26" ry="62" fill="' + dark(c, 0.35) + '"/>' +
        '<ellipse cx="120" cy="296" rx="28" ry="62" fill="' + light(c, 0.25) + '"/>' +
        '<ellipse cx="120" cy="296" rx="12" ry="30" fill="#1d1826"/>' +
        '<ellipse cx="120" cy="296" rx="20" ry="46" fill="none" stroke="' + dark(c, 0.3) + '" stroke-width="3"/>'
    },

    balls: function (id, c) {
      var spikes = ""
      for (var a = 0; a < 7; a++) {
        for (var b = 0; b < 7; b++) {
          var x = 92 + a * 18 + (b % 2) * 9, y = 262 + b * 18
          if (Math.hypot(x - 150, y - 318) < 62) spikes += '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="' + dark("#7b6cf6", 0.3) + '"/><circle cx="' + (x - 1.5) + '" cy="' + (y - 1.5) + '" r="1.6" fill="#fff" opacity=".5"/>'
        }
      }
      var id2 = id + "x"
      return '<defs><radialGradient id="' + id2 + '" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#c9c0ff"/><stop offset=".5" stop-color="#7b6cf6"/><stop offset="1" stop-color="#2f2477"/></radialGradient>' +
        '<radialGradient id="' + id2 + 'n" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#f6ffd0"/><stop offset=".5" stop-color="#cfee52"/><stop offset="1" stop-color="#5d6d12"/></radialGradient></defs>' +
        shadow(id, 205, 398, 150, 20) +
        '<circle cx="150" cy="318" r="70" fill="url(#' + id2 + ')"/>' + spikes +
        '<circle cx="272" cy="338" r="54" fill="url(#' + id + 'r)"/>' +
        '<ellipse cx="256" cy="316" rx="16" ry="10" fill="#fff" opacity=".4"/>' +
        '<circle cx="216" cy="236" r="40" fill="url(#' + id2 + 'n)"/>' +
        '<ellipse cx="204" cy="220" rx="12" ry="7" fill="#fff" opacity=".5"/>'
    },

    stones: function (id, c) {
      var s = ""
      ;[[200, 372, 108, 34], [196, 318, 88, 28], [204, 270, 70, 23], [198, 230, 52, 18]].forEach(function (t, i) {
        s += '<ellipse cx="' + t[0] + '" cy="' + (t[1] + 6) + '" rx="' + t[2] + '" ry="' + t[3] + '" fill="#0d0b12" opacity=".5"/>' +
          '<ellipse cx="' + t[0] + '" cy="' + t[1] + '" rx="' + t[2] + '" ry="' + t[3] + '" fill="url(#' + id + 'v)"/>' +
          '<ellipse cx="' + (t[0] - t[2] * 0.3) + '" cy="' + (t[1] - t[3] * 0.45) + '" rx="' + t[2] * 0.4 + '" ry="' + t[3] * 0.22 + '" fill="#fff" opacity=".22"/>'
      })
      return shadow(id, 200, 410, 130, 18) + s +
        '<path d="M206 214 C220 170 268 160 292 168 C282 200 246 222 206 214Z" fill="#6fcf8e"/>' +
        '<path d="M206 214 C232 196 256 182 286 172" stroke="#3e8c5a" stroke-width="2.5" fill="none"/>' +
        '<g fill="none" stroke="#fff" stroke-linecap="round" opacity=".35" filter="url(#' + id + 'soft)"><path d="M150 200 C140 176 162 160 150 136" stroke-width="5"/><path d="M250 150 C240 128 260 112 250 90" stroke-width="4"/></g>'
    },

    pump: function (id, c) {
      return shadow(id, 200, 414, 96, 16) +
        '<rect x="192" y="122" width="16" height="64" fill="url(#' + id + 'm)"/>' +
        '<path d="M178 100 H262 Q272 100 272 110 V118 H184 Q178 118 178 112Z" fill="#2b2733"/>' +
        '<rect x="180" y="112" width="40" height="26" rx="6" fill="#2b2733"/>' +
        '<rect x="168" y="180" width="64" height="34" rx="8" fill="#2b2733"/>' +
        '<rect x="172" y="184" width="10" height="26" rx="4" fill="#fff" opacity=".18"/>' +
        '<path d="M168 210 H232 C262 218 266 236 266 262 V376 Q266 406 236 406 H164 Q134 406 134 376 V262 C134 236 138 218 168 210Z" fill="' + light(c, 0.05) + '" opacity=".95"/>' +
        '<path d="M136 290 H264 V376 Q264 404 236 404 H164 Q136 404 136 376Z" fill="' + dark(c, 0.15) + '"/>' +
        '<path d="M168 210 H232 C262 218 266 236 266 262 V376 Q266 406 236 406 H164 Q134 406 134 376 V262 C134 236 138 218 168 210Z" fill="url(#' + id + 'g)"/>' +
        '<rect x="152" y="270" width="96" height="96" rx="10" fill="#f8f4ee"/>' +
        '<rect x="168" y="290" width="64" height="9" rx="4.5" fill="#2b2733"/>' +
        '<rect x="176" y="308" width="48" height="5" rx="2.5" fill="#8a8494"/>' +
        '<path d="M188 340 C196 326 206 326 212 340 C206 352 194 352 188 340Z" fill="#7fbf7a"/>'
    },

    acumat: function (id, c) {
      var P = [[86, 290], [318, 270], [352, 384], [64, 404]]
      function at(u, v) {
        var top = [P[0][0] + (P[1][0] - P[0][0]) * u, P[0][1] + (P[1][1] - P[0][1]) * u]
        var bot = [P[3][0] + (P[2][0] - P[3][0]) * u, P[3][1] + (P[2][1] - P[3][1]) * u]
        return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v]
      }
      var fl = ""
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 5; j++) {
          var p = at((i + 0.5) / 9, (j + 0.5) / 5)
          var s = 0.75 + ((j + 0.5) / 5) * 0.5
          fl += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (8 * s).toFixed(1) + '" fill="#f5f2fb"/><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (3.4 * s).toFixed(1) + '" fill="' + dark(c, 0.2) + '"/>'
        }
      }
      return shadow(id, 210, 404, 160, 18) +
        '<polygon points="64,404 352,384 352,396 64,416" fill="' + dark(c, 0.45) + '"/>' +
        '<polygon points="' + P.map(function (q) { return q.join(",") }).join(" ") + '" fill="url(#' + id + 'b)"/>' + fl +
        '<g transform="rotate(-5 200 250)"><rect x="96" y="218" width="190" height="62" rx="31" fill="url(#' + id + 'v)"/>' +
        '<rect x="110" y="228" width="160" height="9" rx="4.5" fill="#fff" opacity=".3"/></g>'
    },

    pillow: function (id, c) {
      var waffle = ""
      for (var x = 120; x <= 290; x += 14) waffle += '<path d="M' + x + ' 196 V378" stroke="' + dark(c, 0.3) + '" stroke-opacity=".18" stroke-width="2"/>'
      for (var y = 200; y <= 378; y += 14) waffle += '<path d="M110 ' + y + ' H294" stroke="' + dark(c, 0.3) + '" stroke-opacity=".18" stroke-width="2"/>'
      var shape = "M120 190 C160 172 240 172 280 190 C300 230 300 340 282 380 C240 398 160 398 120 380 C100 340 100 230 120 190Z"
      return shadow(id, 200, 412, 130, 18) +
        '<defs><clipPath id="' + id + 'cp"><path d="' + shape + '"/></clipPath></defs>' +
        '<path d="' + shape + '" fill="url(#' + id + 'b)"/>' +
        '<g clip-path="url(#' + id + 'cp)">' + waffle + "</g>" +
        '<path d="M134 202 C170 188 230 188 266 202 C282 236 282 336 268 368 C230 382 170 382 132 368 C118 336 118 236 134 202Z" fill="none" stroke="' + light(c, 0.45) + '" stroke-width="2.5" stroke-dasharray="7 6"/>' +
        '<path d="M140 210 C170 198 210 196 236 200" stroke="#fff" stroke-opacity=".5" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<rect x="276" y="300" width="26" height="40" rx="4" fill="#f6efe2" transform="rotate(8 289 320)"/>' +
        '<g fill="#d64561"><circle cx="318" cy="168" r="11"/><circle cx="338" cy="178" r="9"/></g>' +
        '<path d="M318 157 C320 140 332 132 344 130 M338 169 C338 152 340 140 344 130" stroke="#3e8c5a" stroke-width="2.5" fill="none"/>'
    },

    footspa: function (id, c) {
      return shadow(id, 200, 404, 150, 20) +
        '<path d="M80 268 H320 V352 Q320 392 280 392 H120 Q80 392 80 352Z" fill="url(#' + id + 'v)"/>' +
        '<path d="M80 268 H320 V300 Q200 316 80 300Z" fill="' + dark(c, 0.25) + '" opacity=".35"/>' +
        '<ellipse cx="200" cy="268" rx="120" ry="58" fill="url(#' + id + 'b)"/>' +
        '<ellipse cx="200" cy="262" rx="110" ry="48" fill="#fff" opacity=".08"/>' +
        '<g fill="#1d1826"><path d="M150 236 C134 236 128 258 134 280 C140 300 166 302 172 284 C178 264 170 236 150 236Z"/><path d="M250 236 C266 236 272 258 266 280 C260 300 234 302 228 284 C222 264 230 236 250 236Z"/></g>' +
        '<g stroke="' + c + '" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"><path d="M142 256 H162 M140 268 H164 M144 280 H164"/><path d="M238 256 H258 M236 268 H260 M236 280 H256"/></g>' +
        '<circle cx="164" cy="350" r="9" fill="' + dark(c, 0.5) + '"/><circle cx="200" cy="350" r="9" fill="#d6ff3f"/><circle cx="236" cy="350" r="9" fill="' + dark(c, 0.5) + '"/>' +
        '<path d="M96 300 C100 330 110 350 130 360" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none" stroke-linecap="round"/>'
    },

    saltjar: function (id, c) {
      var r = rng(11), crystals = ""
      for (var i = 0; i < 46; i++) {
        crystals += '<rect x="' + (150 + r() * 100).toFixed(1) + '" y="' + (250 + r() * 140).toFixed(1) + '" width="5" height="5" rx="1" fill="#fff" opacity="' + (0.3 + r() * 0.5).toFixed(2) + '" transform="rotate(' + Math.round(r() * 90) + ' 200 300)"/>'
      }
      var petals = ""
      for (var k = 0; k < 9; k++) {
        petals += '<ellipse cx="' + (154 + r() * 92).toFixed(1) + '" cy="' + (256 + r() * 120).toFixed(1) + '" rx="7" ry="4" fill="' + dark(c, 0.25) + '" transform="rotate(' + Math.round(r() * 180) + ' 200 310)"/>'
      }
      return shadow(id, 200, 414, 100, 16) +
        '<defs><clipPath id="' + id + 'jar"><rect x="140" y="196" width="120" height="206" rx="28"/></clipPath></defs>' +
        '<rect x="140" y="196" width="120" height="206" rx="28" fill="#fff" opacity=".12"/>' +
        '<g clip-path="url(#' + id + 'jar)"><rect x="130" y="240" width="140" height="170" fill="' + light(c, 0.15) + '"/>' + crystals + petals + "</g>" +
        '<rect x="140" y="196" width="120" height="206" rx="28" fill="url(#' + id + 'g)"/>' +
        '<rect x="140" y="196" width="120" height="206" rx="28" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>' +
        '<rect x="132" y="160" width="136" height="42" rx="12" fill="#b98a5e"/>' +
        '<rect x="132" y="160" width="136" height="12" rx="6" fill="#fff" opacity=".2"/>' +
        '<path d="M140 180 H260" stroke="#7d5c3c" stroke-width="2" opacity=".5"/>' +
        '<rect x="164" y="300" width="72" height="40" rx="4" fill="#efe3cf"/>' +
        '<rect x="176" y="312" width="48" height="6" rx="3" fill="#7d5c3c"/><rect x="184" y="324" width="32" height="4" rx="2" fill="#b99c7c"/>'
    },

    candle: function (id, c) {
      return shadow(id, 200, 414, 100, 16) +
        '<circle cx="200" cy="164" r="70" fill="#ffcf7a" opacity=".35" filter="url(#' + id + 'blur)"/>' +
        '<path d="M200 126 C214 146 216 166 200 182 C184 166 186 146 200 126Z" fill="#ffb347"/>' +
        '<path d="M200 144 C207 156 207 168 200 178 C193 168 193 156 200 144Z" fill="#fff4c2"/>' +
        '<rect x="198" y="178" width="4" height="22" fill="#3a2b20"/>' +
        '<rect x="132" y="196" width="136" height="206" rx="20" fill="#3b2f3c"/>' +
        '<ellipse cx="200" cy="206" rx="62" ry="12" fill="' + light(c, 0.3) + '"/>' +
        '<rect x="132" y="196" width="136" height="206" rx="20" fill="url(#' + id + 'g)"/>' +
        '<rect x="152" y="270" width="96" height="74" rx="6" fill="' + c + '"/>' +
        '<rect x="168" y="288" width="64" height="8" rx="4" fill="#3b2f3c"/>' +
        '<rect x="176" y="304" width="48" height="5" rx="2.5" fill="' + dark(c, 0.4) + '"/>' +
        '<rect x="188" y="320" width="24" height="5" rx="2.5" fill="' + dark(c, 0.4) + '"/>'
    },

    sleepmask: function (id, c) {
      var shape = "M84 262 C84 196 178 186 200 228 C222 186 316 196 316 262 C316 318 246 330 200 296 C154 330 84 318 84 262Z"
      return shadow(id, 200, 392, 140, 16) +
        '<path d="M86 250 C40 220 70 160 200 160 C330 160 360 220 314 250" stroke="' + dark(c, 0.35) + '" stroke-width="12" fill="none"/>' +
        '<path d="' + shape + '" fill="url(#' + id + 'b)"/>' +
        '<path d="M104 244 C124 214 170 214 188 238" stroke="#fff" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M222 236 C246 214 284 216 298 240" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M98 264 C98 214 176 206 200 244 C224 206 302 214 302 264 C302 306 244 316 200 286 C156 316 98 306 98 264Z" fill="none" stroke="' + light(c, 0.5) + '" stroke-width="2" stroke-dasharray="6 5" opacity=".8"/>' +
        '<g fill="#fff" opacity=".85"><path d="M306 120 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z"/><path d="M96 130 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/></g>' +
        '<path d="M330 330 a26 26 0 1 1 -18 -44 a20 20 0 1 0 18 44z" fill="#ffd25e" opacity=".9"/>'
    },

    zafu: function (id, c) {
      var pleats = ""
      for (var i = 0; i < 13; i++) {
        var x = 84 + i * 19.3
        pleats += '<path d="M' + x.toFixed(1) + " " + (262 + Math.sin((i / 12) * Math.PI) * 42).toFixed(1) + " Q" + (x + 4).toFixed(1) + " 305 " + x.toFixed(1) + " " + (334 + Math.sin((i / 12) * Math.PI) * 42).toFixed(1) + '" stroke="' + dark(c, 0.35) + '" stroke-opacity=".45" stroke-width="2.5" fill="none"/>'
      }
      return shadow(id, 200, 404, 140, 18) +
        '<path d="M80 262 V334 A120 44 0 0 0 320 334 V262Z" fill="url(#' + id + 'h)"/>' + pleats +
        '<ellipse cx="200" cy="262" rx="120" ry="44" fill="url(#' + id + 'b)"/>' +
        '<ellipse cx="170" cy="248" rx="60" ry="14" fill="#fff" opacity=".2"/>' +
        '<circle cx="200" cy="262" r="10" fill="' + dark(c, 0.4) + '"/><circle cx="197" cy="259" r="3" fill="#fff" opacity=".5"/>'
    },
  }

  var SCENES = {
    massage: ["#3a2463", "#b0479a", "#ff8fc7"],
    gesicht: ["#4a2440", "#e07a8f", "#ffc1a6"],
    aroma: ["#3d2350", "#c4723f", "#ffcf7a"],
    yoga: ["#173d47", "#2f9e8f", "#9ff0d4"],
    schlaf: ["#1c2150", "#6d5cc4", "#c3b3ff"],
  }

  // Soft glow blob drawn with a radial gradient (cheaper than a blur filter)
  function blob(id, n, cx, cy, r, color, op) {
    var gid = id + "o" + n
    return '<radialGradient id="' + gid + '"><stop offset="0" stop-color="' + color + '" stop-opacity="' + op + '"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></radialGradient>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + gid + ')"/>'
  }

  function scene(product, color, mode) {
    var id = "v" + ++uid
    var pal = SCENES[product.category] || SCENES.massage
    var c = color || Object.values(product.swatches || {})[0] || "#9d7bff"
    var draw = DRAW[product.art] || DRAW.guasha
    var bg, transform = ""
    mode = mode || "studio"

    if (mode === "studio") {
      bg =
        '<rect width="400" height="500" fill="url(#' + id + 'bg)"/>' +
        blob(id, 1, 330, 90, 170, pal[2], 0.45) +
        blob(id, 2, 60, 430, 200, pal[1], 0.6) +
        '<path d="M80 470 V200 A120 120 0 0 1 320 200 V470Z" fill="#fff" opacity=".07"/>' +
        '<path d="M80 470 V200 A120 120 0 0 1 320 200 V470" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>' +
        '<ellipse cx="200" cy="420" rx="170" ry="34" fill="#fff" opacity=".08"/>'
      transform = ' transform="translate(-30 -40) scale(1.15)"'
    } else if (mode === "detail") {
      bg =
        '<rect width="400" height="500" fill="url(#' + id + 'bg2)"/>' +
        blob(id, 1, 80, 80, 210, pal[2], 0.5) +
        blob(id, 2, 360, 460, 230, pal[1], 0.65) +
        '<g fill="#fff" opacity=".7"><circle cx="70" cy="380" r="3"/><circle cx="340" cy="130" r="2.5"/><circle cx="300" cy="70" r="1.8"/><circle cx="110" cy="120" r="2"/></g>'
      transform = ' transform="translate(-110 -120) scale(1.55)"'
    } else {
      // "pattern": flat lay with tiled dots
      var dots = ""
      for (var x = 20; x < 400; x += 40) for (var y = 20; y < 500; y += 40) dots += '<circle cx="' + x + '" cy="' + y + '" r="2" fill="#fff" opacity=".12"/>'
      bg = '<rect width="400" height="500" fill="' + pal[0] + '"/>' + dots +
        '<circle cx="200" cy="270" r="170" fill="' + pal[1] + '" opacity=".55"/>' +
        '<circle cx="200" cy="270" r="130" fill="' + pal[2] + '" opacity=".25"/>'
      transform = ' transform="rotate(-14 200 270) translate(0 -10)"'
    }

    return (
      '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + product.title.replace(/"/g, "") + '" preserveAspectRatio="xMidYMid slice">' +
      "<defs>" + defs(id, c) +
      '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + dark(pal[0], 0.35) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + dark(pal[1], 0.35) + '"/><stop offset="1" stop-color="' + dark(pal[0], 0.2) + '"/></linearGradient>' +
      "</defs>" + bg + "<g" + transform + ">" + draw(id, c) + "</g></svg>"
    )
  }

  window.VermontArt = { scene: scene, light: light, dark: dark }
})()
