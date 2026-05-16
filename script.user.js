// ==UserScript==
// @name         Login Override
// @version      0.4.1
// @description  Overrides the login function on a given website
// @match        http://pass.sdu.edu.cn/cas/login*
// @match        https://pass.sdu.edu.cn/cas/login*
// @match        https://pass-sdu-edu-cn-s.atrust.sdu.edu.cn:81/cas/login*
// @match        https://pass-sdu-edu-cn.atrust.sdu.edu.cn:81/cas/login*
// @match        https://webvpn.sdu.edu.cn/https/77726476706e69737468656265737421e0f6528f69236c45300d8db9d6562d/cas/login*
// @match        https://webvpn.sdu.edu.cn/http/77726476706e69737468656265737421e0f6528f69236c45300d8db9d6562d/cas/login*
// @match        http://pass.sdu.edu.cn/tpass/login*
// @match        https://pass.sdu.edu.cn/tpass/login*
// @match        https://pass-sdu-edu-cn-s.atrust.sdu.edu.cn/tpass/login*
// @match        https://pass-sdu-edu-cn.atrust.sdu.edu.cn/tpass/login*
// @match        https://webvpn.sdu.edu.cn/https/77726476706e69737468656265737421e0f6528f69236c45300d8db9d6562d/tpass/login*
// @match        https://webvpn.sdu.edu.cn/http/77726476706e69737468656265737421e0f6528f69236c45300d8db9d6562d/tpass/login*
// @updateURL    https://raw.githubusercontent.com/zeroHYH/Bypass-SDU-Unified-Identity-Authentication-Platform-Device-Check/main/script.meta.js
// @downloadURL  https://raw.githubusercontent.com/zeroHYH/Bypass-SDU-Unified-Identity-Authentication-Platform-Device-Check/main/script.user.js
// @grant        none
// ==/UserScript==

const YOUR_CUSTOM_DEVICE_FINGERPRINT = "";

(function () {
  "use strict";

  const targetUrl = location.href
    .replace(/^http:/, "https:")
    .replace("pass-sdu-edu-cn.atrust.sdu.edu.cn:81", "pass-sdu-edu-cn-s.atrust.sdu.edu.cn:81")
    .replace("webvpn.sdu.edu.cn/http/", "webvpn.sdu.edu.cn/https/");

  if (location.href !== targetUrl) return location.replace(targetUrl);

  window.login = function () {
    const $u = $("#un"), $p = $("#pd");
    const username = $u.val().trim(), password = $p.val();

    if (!username) return $u.focus().parent().addClass("login_error_border");
    if (!password) return $p.focus().parent().addClass("login_error_border");

    $u.prop("disabled", true);
    $p.prop("disabled", true);

    const fp = YOUR_CUSTOM_DEVICE_FINGERPRINT || username;
    console.log(`[Login Script] Using Fingerprint: ${fp}`);

    const enc = (str) => strEnc(str, "1", "2", "3");

    const murmur_s = hex_md5(fp);
    const enc_md5 = enc(murmur_s);

    $("#ul").val(username.length);
    $("#pl").val(password.length);
    $("#rsa").val(enc(username + password + $("#lt").val()));

    $.post(
      "device",
      {
        d: fp,
        d_s: murmur_s,
        d_md5: enc_md5,
        d_browser_md5: enc_md5,
        i: enc(fp),
        m: "1",
        u: enc(username),
        p: enc(password),
      },
      function (ret) {
        if (ret.info === "validErr" || ret.info === "notFound") location.reload();
        else if (ret.info === "bind") {
          $("#phone").val(ret.m);
          if (typeof phone === "function") phone(murmur_s, fp);
        }
        else if (ret.info === "mobileErr") $("#errormsg2").show().text("尚未绑定手机");
        else if (ret.info === "binded" || ret.info === "pass") $("#loginForm")[0].submit();
      },
      "json"
    );
  };
})();