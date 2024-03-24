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
const main = ref()
import * as echarts from "echarts";
import { onMounted } from "vue";
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
  if (!isKeydown.value) {
    // return
  }
  // 获取画布元素
  const canvas = document.getElementById("dstImg") as HTMLCanvasElement;
  // 获取画布元素和上下文
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
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

onMounted(() => {
  initChart()
})
const initChart = () => {

  // 基于准备好的dom，初始化echarts实例
  myChart.value = echarts.init(main.value);
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
  // setInterval(function () {
  //   for (var i = 0; i < 5; i++) {
  //     data.shift();
  //     data.push(randomData());
  //   }
  //   myChart.setOption({
  //     series: [
  //       {
  //         data: data
  //       }
  //     ]
  //   });
  // }, 1000);
  // 使用刚指定的配置项和数据显示图表。
  myChart.value.setOption(option);
  // resize 
  myChart.value.resize()
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

  <div class="operation-area">
    <div id="main" :style="{visibility: !srcImgUrl ? 'hidden' : 'visible'}" ref="main" style="width: 100%; height: 300px"></div>

    <el-button type="default" id='uploadFile' @click="handleUpload">Select Image</el-button>
    <el-button type="primary" id='uploadFile' :disabled="!srcImgUrl" @click="saveImage">Save Image</el-button>
    <!--图片读入区域-->
    <input type="file" @change="changeIpu" id="inputFile" name="file" style='display:none' />
  </div>
  <!--结果展示区域-->
  <div class="input-output">
    <img v-if="srcImgUrl" id="srcImg" @load="loadimg" style="width: 500px;" :src="srcImgUrl" />

    <img v-else class="empty-img" :src="'/empty.svg'" alt="No Image" />
    <canvas
      v-if="srcImgUrl"
      @mousedown="() => isKeydown = true"
      @mouseup="handleKeyUp"
      @mousemove="getMouseGrayscale"
      id="dstImg"
    />
  </div>
</template>

<style scoped>
.operation-area {
  width: 140vh;
}

.input-output {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.empty-img {
  width: 50%;
}

#srcImg {
  width: 100%;
  height: auto;
  /* object-fit: cover; */
}

img {
  width: 100%;
  margin: 0 20px;

}
</style>
