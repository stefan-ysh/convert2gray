<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, onUnmounted, ref } from 'vue';
import {
  Download,
  PictureRounded,
  Upload,
  DataLine,
  BrushFilled
} from '@element-plus/icons-vue'
// 表格数据，存储的是坐标点和对应的灰度值 [{ x: 0, y: 0, value: 0 }]
const data = ref<any[]>([]);
// 鼠标是否按下
const isKeydown = ref(false)
// 图表实例
const myChart = ref()
// 图表容器
const chartContainer = ref()
// 源地址
const srcImgUrl = ref()
// 路径颜色
const pathColor = ref('#5a9cf8')
// 预设颜色
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
])
// 图表线段颜色
const pieces = ref<any>([])
// 上一条路径的索引，用于绘制多条路径
const lastPathIndex = ref(0)
const changeIpu = (e: any) => {
  srcImgUrl.value = URL.createObjectURL(e.target.files[0])
  // 清除之前数据,避免无法上传同一个文件
  e.target.value = '';
}
const loadimg = () => {
  const cv = (window as any).opencv
  if (!cv) {
    return
  }
  const src = cv.imread('srcImg');
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.imshow("dstImg", gray);
  src.delete();
}

// 清除路径
const clearPath = () => {
  myChart.value && myChart.value.setOption({
    series: [{
      data: []
    }]
  })
  data.value = []
  lastPathIndex.value = 0
  loadimg()
}
const handleUpload = () => {
  // 清除之前数据
  data.value = []
  // 清除之前的图表
    // 重新渲染
  myChart.value && myChart.value.setOption({
    series: [{
      data: data.value
    }]
  })
  // 清楚图片 src
  srcImgUrl.value = ''
  const uploadInput = document.getElementById('inputFile')
  uploadInput && uploadInput.click()
}

//保存灰度图
const saveImage = () => {
  const canvas = document.getElementById('dstImg') as HTMLCanvasElement
  const img = canvas?.toDataURL('image/png')
  if (img) {
    const a = document.createElement('a')
    a.href = img
    a.download = 'image.png'
    a.click()
    a.remove()
  }
}
// 保存图表图片
 const saveEchartImage = () => {
  const imgDataURL = myChart.value.getDataURL({
    // 导出的格式，可以是 'png', 'jpeg'
    type: 'png',
    // 导出的图片分辨率比例，默认为 1
    pixelRatio: 2,
    // 导出的图片背景色，默认是 'white'
    backgroundColor: '#ffffff'
  });

  // 创建一个a标签模拟点击进行下载
  const saveLink = document.createElement('a');
  saveLink.href = imgDataURL;
  // 下载的图片名称
  saveLink.download = 'echart_image';
  // 模拟点击
  saveLink.click();
  // 移除a标签
  saveLink.remove();
}
// 鼠标事件处理函数
const getMouseGrayscale = (event: MouseEvent) => {
  !myChart.value && initChart()
  if (!isKeydown.value) {
    return
  }
  // 获取画布元素
  const canvas = document.getElementById("dstImg") as HTMLCanvasElement;
  // 获取画布元素和上下文
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  if (!ctx) {
    return;
  }

  // 绘制一些内容到canvas上
  // ctx.fillStyle = "blue";
  // ctx.fillRect(0, 0, 150, 100);
  // 获取鼠标位置
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  const canvasHeight = canvas.height;

  // 确保mouseY在合理范围内
  let correctedMouseY = mouseY > canvasHeight ? canvasHeight : mouseY;

  // 然后进行Y坐标的转换
  correctedMouseY = canvasHeight - correctedMouseY;

  // 获取鼠标位置的像素颜色
  const pixel = ctx.getImageData(mouseX, mouseY, 1, 1).data;

  // 计算灰度值
  const grayscale = Math.round(
    0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]
  );

  // 在控制台输出灰度值
  console.log(`Grayscale value at (${mouseX}, ${correctedMouseY}): ${grayscale}`);
  data.value.push({
    x: `${mouseX}`,
    y: `${correctedMouseY}`,
    originalY: `${mouseY}`,
    value: [`${data.value.length}`, grayscale]
  })
  // 渲染图表
  renderChart()
}

// 初始化图表
const initChart = () => {
  // let theme = 'light';
// 图表主题根据系统主题进行配置
  // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //   theme = 'dark';
  // }
  // 基于准备好的dom，初始化echarts实例
  myChart.value = echarts.init(chartContainer.value);
  
  const option = {
    title: {
      // 灰度图
      text: 'Grayscale Line Chart',
      left: 'center'
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      // formatter: function (params: any) {
      //   params = params[0];
      //   var date = new Date(params.name);
      //   return (
      //     date.getDate() +
      //     '/' +
      //     (date.getMonth() + 1) +
      //     '/' +
      //     date.getFullYear() +
      //     ' : ' +
      //     params.value[1]
      //   );
      // },
      axisPointer: {
        type: 'cross',
        animation: true
      }
    },

    // dataZoom: [
    //   {
    //     show: true,
    //     realtime: false,
    //     start: 30,
    //     end: 70,
    //     xAxisIndex: [0, 1]
    //   },
    //   {
    //     type: 'outside',
    //     realtime: false,
    //     start: 0,
    //     // end: 70,
    //     xAxisIndex: [0, 1]
    //   }
    // ],
    grid: {
      left: '5%',
      right: '0%',
      bottom: '5%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      // boundaryGap: [1],
      // 0-255之间
      // 刻度间距
      interval: 15,
      min: 0,
      max: 255,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#ddd',
          width: 1,
          opacity: 0.5
        }
      }
    },
    series: [
      {
        name: 'Fake Data',
        type: 'line',
        showSymbol: false,
        // // 圆点 tooltip
        // symbol: 'circle',
        // symbolSize: 2,
        // // 圆点颜色
        // itemStyle: {
        //   color: '#409EFF'
        // },
        // // 圆点 tooltip
        // label: {
        //   show: true,
        //   position: 'top',
        //   color: '#409EFF'
        // },
        smooth: true
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.value.setOption(option);
}
// 绘制鼠标移动的路径
const drawMousePath  = () => {
  // 根据data 中的坐标值在 canvas 上绘制圆点，记录其路径
  const canvas = document.getElementById('dstImg') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (ctx) {
    data.value.forEach((item: any, index: number) => {
      if (index < lastPathIndex.value + 1) {
        return
      }
      ctx.beginPath()
      ctx.arc(item.x, item.originalY, 5, 0, 5 * Math.PI)
      ctx.fillStyle = pathColor.value
      ctx.fill()
    })
  }
  lastPathIndex.value = data.value.length - 1
}
// 渲染图表
const renderChart = () => {
  // x 轴最大值
  const max = data.value.length
  const idx = lastPathIndex.value + 1

  // 线段颜色
  pieces.value.push(
    {
      gt: idx,
      lte: idx + data.value.length - idx,
      color: pathColor.value,
    }
  )

  // 视觉映射，此处作用为分线段颜色标记
  const visualMap = [{
    show: false,
    dimension: 0,
    seriesIndex: 0,
    pieces: pieces.value,
  }]

  // 重新渲染
  myChart.value.setOption({
    xAxis: {
      max
    },
    visualMap,
    series: [{
      data: data.value
    }]
  })
}
// 鼠标抬起事件处理
const handleKeyUp = () => {
  isKeydown.value = false

  // 重新渲染
  myChart.value.setOption({
    series: [{
      data: data.value
    }]
  })
  // 绘制鼠标移动的路径
  drawMousePath()
}
onMounted(() => {
  window.addEventListener('resize', () => {
    myChart.value && myChart.value.resize()
  })
})
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    myChart.value && myChart.value.resize()
  })
})
const exportData = () => {
  // 数据结构是这样的 [{name: '', value: ''}]，要将此类数据导出表格，一列是 name ，一列是 value
  // , 同一行 \n 换行
  let dataStr = 'x,y,灰度值\n';
  data.value.forEach((item: any) => {
    // 如果 x或者 y中，有一个是负数，则忽略此数据
    if (item.x < 0 || item.y < 0) {
      return
    }
    dataStr += `${item.x}, ${item.y}, ${item.value[1]}\n`;
  });
  // 创建一个新的Blob对象，包含JSON数据
  const blob = new Blob([dataStr], { type: 'application/json' });
  // 创建一个指向该Blob的URL
  const url = URL.createObjectURL(blob);
  // 创建一个新的<a>元素用于下载
  const a = document.createElement('a');
  // 设置下载链接的href为Blob URL
  a.href = url;
  // 设置下载文件的名称，这里添加了一个时间戳以确保唯一性
  a.download = `data_${new Date().toISOString().replace(/[^\w\s]/gi, '')}.csv`;
  // 触发下载
  a.click();
  // 释放URL对象
  URL.revokeObjectURL(url);
  // 移除创建的<a>元素
  a.remove();
};
</script>

<template>

  <div class="w-full mb-2">
    <div id="chartContainer" :style="{visibility: !srcImgUrl ? 'hidden' : 'visible'}" ref="chartContainer" class="w-[95%] h-80"></div>
    <el-button type="primary" @click="handleUpload">
      <el-icon>
        <Upload />
      </el-icon>
      <span class="hidden md:block">
        上传图像
      </span>
    </el-button>
    <el-button type="primary" v-if="srcImgUrl" @click="saveImage">
      <el-icon>
        <PictureRounded />
      </el-icon>
      <span class="hidden md:block">
        保存灰度图
      </span>
    </el-button>
    <el-button type="primary" v-if="srcImgUrl" @click="exportData">
      <el-icon>
        <Download />
      </el-icon>
      <span class="hidden md:block">
        导出数据
      </span>
    </el-button>
    <el-button type="primary" v-if="srcImgUrl" @click="saveEchartImage">
      <el-icon>
        <DataLine />
      </el-icon>
      <span class="hidden md:block">
        保存图表
      </span>
    </el-button>
    <div class="inline-block ml-3 mr-3" v-if="srcImgUrl">
      <!-- <span class="demonstration">路径颜色</span> -->
      <el-color-picker v-model="pathColor" :predefine="predefineColors" />
    </div>
    <el-button type="primary" v-if="srcImgUrl" @click="clearPath">
      <el-icon>
        <BrushFilled />
      </el-icon>
      <span class="hidden md:block">
        清除路径
      </span>
    </el-button>
    <!--图片读入区域-->
    <input type="file" accept="image/*" @change="changeIpu" id="inputFile" name="file" class="hidden" />
  </div>
  <!--结果展示区域-->
  <div class="w-[100vw] flex justify-evenly items-center flex-col md:flex-row">
    <img v-if="srcImgUrl" id="srcImg" @load="loadimg" class="h-auto w-4/5 md:w-1/2 mr-1" :src="srcImgUrl" />

    <img v-else class=" w-full md:w-1/3" :src="'/empty.svg'" alt="No Image" />
    <canvas
      class="mt-10 md:mt-0 ml-1 w-4/5 md:w-1/2"
      v-if="srcImgUrl"
      @mousedown="() => isKeydown = true"
      @mouseup="handleKeyUp"
      @mousemove="getMouseGrayscale"
      @mouseleave="handleKeyUp"
      id="dstImg"
    />
  </div>
  <!-- 图片caption -->
  <!-- <div v-if="srcImgUrl" class="w-full flex items-center justify-around">
    <div>
      <el-tag size="large">Before</el-tag>
    </div>
    <div>
      <el-tag size="large">After</el-tag>
    </div>
  </div> -->
</template>
