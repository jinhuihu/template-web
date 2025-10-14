// 主JavaScript文件

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成');
  
  // 可以在这里添加交互逻辑
  // 例如：平滑滚动、动画效果等
  
  // 示例：为所有按钮添加点击效果
  const buttons = document.querySelectorAll('button, .product-button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('按钮被点击:', this.textContent);
    });
  });
  
  // 示例：类别筛选功能
  const categories = document.querySelectorAll('.category');
  categories.forEach(category => {
    category.addEventListener('click', function() {
      categories.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      console.log('选择类别:', this.textContent);
    });
  });
});

