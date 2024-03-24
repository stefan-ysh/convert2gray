<script setup lang="ts">
const data = ref<any[]>([
  // {
  //   value: ['22222', 255]
  // },
  // {
  //   value: ['030303', 2]
  // }
]);
const isKeydown = ref(false)
const myChart = ref()
const chartContainer = ref()
import * as echarts from "echarts";
import { ref } from 'vue';
const srcImgUrl = ref()
const changeIpu = (e: any) => {
  srcImgUrl.value = URL.createObjectURL(e.target.files[0])
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
const handleUpload = () => {
  const uploadInput = document.getElementById('inputFile')
  uploadInput && uploadInput.click()
}
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

// 鼠标事件处理函数
const getMouseGrayscale = (event: MouseEvent) => {
  !myChart.value && initChart()
  if (!isKeydown.value) {
    // return
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

  // 获取鼠标位置的像素颜色
  const pixel = ctx.getImageData(mouseX, mouseY, 10, 10).data;

  // 计算灰度值
  const grayscale = Math.round(
    0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]
  );

  // 在控制台输出灰度值
  // console.log(`Grayscale value at (${mouseX}, ${mouseY}): ${grayscale}`);
  data.value.push({
    name: `(${mouseX}, ${mouseY})`,
    value: [`${data.value.length}`, grayscale]
  })

  // 重新渲染
  myChart.value.setOption({
    series: [{
      data: data.value
    }]
  })
  // 绘制一个小像素在鼠标位置
  // ctx.fillRect(mouseX, mouseY, 1, 1);
}

const initChart = () => {

  // 基于准备好的dom，初始化echarts实例
  myChart.value = echarts.init(chartContainer.value);
  // const data = [
  //   {
  //     value: [1, 2]
  //   },
  //   {
  //     value: [3, 2]
  //   },
  // ];
  const option = {
    title: {
      // 灰度图
      text: 'Grayscale Line Chart',
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
    // toolbox: {
    //   feature: {
    //     // dataZoom: {
    //     //   yAxisIndex: 'none'
    //     // },
    //     // restore: {},
    //     saveAsImage: {}
    //   }
    // },
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
      right: '5%',
      bottom: '5%',
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
        show: false
      }
    },
    series: [
      {
        name: 'Fake Data',
        type: 'line',
        showSymbol: false,
        data: data.value,
        smooth: true
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.value.setOption(option);
  // myChart.value && myChart.value.resize()
}
const handleKeyUp = () => {
  isKeydown.value = false

  // 重新渲染
  myChart.value.setOption({
    series: [{
      data: data.value
    }]
  })
}
</script>

<template>

  <div class="w-full">
    <div id="chartContainer" :style="{visibility: !srcImgUrl ? 'hidden' : 'visible'}" ref="chartContainer" class="w-full h-80"></div>

    <el-button type="default" @click="handleUpload">Select Image</el-button>
    <el-button type="primary" :disabled="!srcImgUrl" @click="saveImage">Save Image</el-button>
    <!--图片读入区域-->
    <input type="file" @change="changeIpu" id="inputFile" name="file" style='display:none' />
  </div>
  <!--结果展示区域-->
  <div class="w-full flex justify-evenly items-center flex-col md:flex-row">
    <img v-if="srcImgUrl" id="srcImg" @load="loadimg" class="h-auto" style="width: 500px;" :src="srcImgUrl" />

    <img v-else class="w-1/2" :src="'/empty.svg'" alt="No Image" />
    <canvas
      class="mt-10 md:mt-0"
      v-if="srcImgUrl"
      @mousedown="() => isKeydown = true"
      @mouseup="handleKeyUp"
      @mousemove="getMouseGrayscale"
      id="dstImg"
    />
  </div>
</template>
