export const deviceDetect = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  isAndroid: () => /Android/.test(navigator.userAgent),
  isDesktop: () => !deviceDetect.isMobile(),
  getOS: () => { if (deviceDetect.isIOS()) return 'iOS'; if (deviceDetect.isAndroid()) return 'Android'; return 'Desktop'; },
};
