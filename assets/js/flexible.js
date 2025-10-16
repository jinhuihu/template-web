/**
 * 移动端适配解决方案 - Flexible.js
 * 
 * 基于 750px 设计稿的 rem 自适应方案
 * 设计稿宽度: 750px
 * 基准字体: 100px (1rem = 100px)
 * 
 * 使用方法：
 * 1. 设计稿标注 750px，实际编写时除以 100 得到 rem 值
 * 2. 例如：设计稿 300px → 代码写 3rem
 * 3. 例如：设计稿 40px → 代码写 0.4rem
 */

(function(win, doc) {
  'use strict';
  
  const docEl = doc.documentElement;
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
  
  // 配置项
  const config = {
    designWidth: 750,        // 设计稿宽度（保持750，用于计算）
    maxWidth: 620,           // PC容器宽度（调整为620px）
    remBase: 100,            // rem基准值（1rem = 100px）
    pcSimulator: true        // 是否启用PC端模拟器
  };
  
  /**
   * 设置根元素字体大小
   */
  function setRemUnit() {
    const clientWidth = docEl.clientWidth || win.innerWidth;
    const isMobile = clientWidth < 768; // 768px以下视为移动端
    
    if (isMobile) {
      // 移动端：按比例缩放
      const scale = clientWidth / config.designWidth;
      const remSize = config.remBase * scale;
      
      // 限制最小字体大小
      const finalRemSize = Math.max(remSize, 50); // 最小50px
      docEl.style.fontSize = finalRemSize + 'px';
      
      // 设置自定义属性供CSS使用
      docEl.setAttribute('data-device', 'mobile');
      docEl.style.setProperty('--base-font-size', finalRemSize + 'px');
      
    } else {
      // PC端：使用模拟器
      if (config.pcSimulator) {
        // 按照620px容器计算fontSize，保持设计稿比例
        const pcRemBase = (config.maxWidth / config.designWidth) * config.remBase;
        docEl.style.fontSize = pcRemBase + 'px';
        docEl.setAttribute('data-device', 'pc');
        docEl.style.setProperty('--base-font-size', pcRemBase + 'px');
        docEl.style.setProperty('--simulator-width', config.maxWidth + 'px');
        
        // 添加PC模拟器标识
        if (!docEl.classList.contains('pc-simulator')) {
          docEl.classList.add('pc-simulator');
        }
      } else {
        // 不使用模拟器，按PC端比例
        const remSize = Math.min(clientWidth / 10, config.remBase);
        docEl.style.fontSize = remSize + 'px';
        docEl.setAttribute('data-device', 'pc');
      }
    }
    
    // 触发自定义事件，通知其他脚本
    const event = new CustomEvent('remUnitChange', {
      detail: {
        fontSize: docEl.style.fontSize,
        device: docEl.getAttribute('data-device'),
        clientWidth: clientWidth
      }
    });
    win.dispatchEvent(event);
  }
  
  /**
   * 防止页面缩放
   */
  function preventZoom() {
    // 阻止双击缩放
    let lastTouchEnd = 0;
    doc.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // 阻止手势缩放
    doc.addEventListener('gesturestart', function(event) {
      event.preventDefault();
    });
  }
  
  /**
   * 设置viewport
   */
  function setViewport() {
    let metaEl = doc.querySelector('meta[name="viewport"]');
    
    if (!metaEl) {
      metaEl = doc.createElement('meta');
      metaEl.setAttribute('name', 'viewport');
      doc.head.appendChild(metaEl);
    }
    
    // 设置viewport配置
    const viewportContent = [
      'width=device-width',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'minimum-scale=1.0',
      'user-scalable=no',
      'viewport-fit=cover'
    ].join(', ');
    
    metaEl.setAttribute('content', viewportContent);
  }
  
  /**
   * 初始化
   */
  function init() {
    // 设置viewport
    setViewport();
    
    // 设置rem单位
    setRemUnit();
    
    // 防止缩放（移动端）
    if (docEl.clientWidth < 768) {
      preventZoom();
    }
    
    // 监听窗口大小变化
    win.addEventListener(resizeEvt, setRemUnit, false);
    win.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        setRemUnit();
      }
    }, false);
    
    // 监听DOMContentLoaded
    if (doc.readyState === 'complete') {
      setRemUnit();
    } else {
      doc.addEventListener('DOMContentLoaded', setRemUnit, false);
    }
  }
  
  // 立即执行
  init();
  
  // 暴露配置方法（可选）
  win.flexible = {
    setRemUnit: setRemUnit,
    config: config
  };
  
  // 打印适配信息（开发模式）
  if (win.location.hostname === 'localhost' || win.location.hostname === '127.0.0.1') {
    console.log('%c 📱 移动端适配已启用', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log('%c 设计稿宽度: 750px | rem基准: 100px', 'color: #666; font-size: 12px;');
    console.log('%c 当前设备: ' + docEl.getAttribute('data-device'), 'color: #666; font-size: 12px;');
    console.log('%c 当前fontSize: ' + docEl.style.fontSize, 'color: #666; font-size: 12px;');
  }
  
})(window, document);

