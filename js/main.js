// csvファイルのドラッグ&ドロップ
(function () {
  "use strict";

  const dropZone = document.getElementById("drop-zone");
  const input = document.getElementById("slider");
  const precision = document.getElementById("precision");
  const recall = document.getElementById("recall");
  const f1 = document.getElementById("f1");

  let items;

  plotGraph();

  //スライダーで閾値を変更したとき
  input.addEventListener("input", () => {
    const thresh = document.getElementById("slider").value;
    reflectItems(items, thresh, 0);
  });

  //ドラッグしたとき
  dropZone.addEventListener(
    "dragover",
    function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.style.background = "#e1e7f0"; //後ほど程クラスのつけ外しで色を変えるように変更する
    },
    false
  );

  //ドラッグが離れたとき
  dropZone.addEventListener(
    "dragleave",
    function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.style.background = "#fff"; //背景色を白に戻す
    },
    false
  );

  //ドロップしたとき
  dropZone.addEventListener(
    "drop",
    function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.style.background = "#fff"; //背景色を白に戻す
      const files = e.dataTransfer.files[0]; //ドロップしたファイルを取得
      const reader = new FileReader(); //リーダーインスタンス定義

      //エラーメッセージ
      if (files.length > 1)
        return alert("アップロードできるファイルは1つだけです。");

      reader.readAsText(files); //ファイル読み込み
      reader.onload = function (e) {
        //処理の実行
        const result = e.target.result;
        const data = readCSV(result);
        items = bookItems(data); //list: [[pre], [rec], [conf]]
        reflectItems(items, 0.5, 1000);

        //エラーメッセージ
        reader.onerror = function () {
          alert("エラー：ファイルを読み込めませんでした");
        };
      };
    },
    false
  );

  const readCSV = (csvdata) => {
    const split_data = csvdata.split("\n");
    const data = [];
    for (let i = 0; i < split_data.length; i++) {
      //csvの1行のデータを取り出す
      let row_data = split_data[i];
      data[i] = row_data.split(",");
    }
    return data;
  }

  function bookItems(data) {
    let items = [];
    let pres = [];
    let recs = [];
    let confs = [];
    for (let i = 1; i < data.length; i++) {
      pres.push(data[i][1]);
      recs.push(data[i][2]);
      confs.push(data[i][3]);
    }
    items.push(pres, recs, confs);
    return items;
  }

  function reflectItems(items, thresh, duration) {
    const idx = idxAtThresh(items, thresh);
    const pre = items[0][idx];
    const rec = items[1][idx];
    precision.textContent = parseFloat(pre).toFixed(2);
    recall.textContent = parseFloat(rec).toFixed(2);
    f1.textContent = calcF1(pre, rec).toFixed(2);

    plotGraph(items[0], items[1], idx, duration);
  }

  function idxAtThresh(items, thresh) {
    const isLargeNumber = (el) => el < thresh;
    const idx = items[2].findIndex(isLargeNumber); //閾値より数値が小さい最初のインデックス
    return idx - 1; //閾値より大きい最初のインデックス
  }

  function calcF1(pre, rec) {
    return (2 * pre * rec) / (parseFloat(pre) + parseFloat(rec));
  }

  function convertToDics(pre, rec) {
    const dics = [];
    for (let i = 0; i < rec.length; i++) {
      let dic = { x: rec[i], y: pre[i] };
      dics.push(dic);
    }
    return dics;
  }

  // グラフの描画
  function plotGraph(pre, rec, idx, duration) {
    let dics;
    let x;
    let y;

    if (rec) {
      dics = convertToDics(pre, rec);
      x = rec[idx];
      y = pre[idx];
    }

    var type = "line";
    var data = {
      datasets: [
        {
          data: dics,
          borderColor: "rgba(30, 144, 255, 0.6)",
          backgroundColor: "rgba(30, 144, 255, 0.3)", //skyblue,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          type: "scatter",
          data: [
            {
              x: x,
              y: y,
            },
          ],
          pointRadius: 5,
          pointBackgroundColor: "rgba(30, 144, 255, 1.0)",
        },
      ],
    };
    var options = {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Precision",
            },
            ticks: {
              min: 0,
              max: 1,
              stepSize: 0.1,
            },
            type: "linear",
            position: "left",
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Recall",
            },
            ticks: {
              min: 0,
              max: 1,
              stepSize: 0.1,
            },
            type: "linear",
            position: "bottom",
          },
        ],
      },
      legend: {
        display: false,
      },
      animation: {
        duration: duration,
      },
    };

    var ctx = document.getElementById("graph").getContext("2d");

    var myChart = new Chart(ctx, {
      type: type,
      data: data,
      options: options,
    });
  }
})();
