// 在全局作用域中声明opencv对象
declare global {
  interface Window {
    opencv: any; // 根据OpenCV的API定义更具体的类型
  }
}

// 然后在某个初始化函数中设置这个对象
function onOpenCvReady() {
  window.opencv = {}; // 初始化OpenCV对象
}
