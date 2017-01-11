app.controller('individual_Ctrl',function ($scope,$rootScope,$state,share_data) {

    var fs = require('fs');
    var request = require('request');

    let vm = this;
    vm.individual = share_data.individual;

    vm.datas = [];
    vm.judge = [];
    vm.data = [];
    vm.options = {};
    var y_max = -1;
    var y_low = 10000000000000;

    vm.back=function () {
        $state.go('home');
    };

    var num = vm.individual.number;
    var place = vm.individual.place;
    console.log(vm.individual.place);
    if (place === 'sh') place = 'ss';
    else place = 'sz';

    var file_url = `http://127.0.0.1:5000/table.csv?s=${num}.${place}`;
    console.log(file_url);
    var options = {
        url: file_url,
        method: 'GET',
        headers: {
            'User-Agent': 'request'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            $scope.$apply(() => {
                var data = body.split("\n");
                    for (var i = 1; i < 8 ; i++){
                        var color;
                        var keys = data[i].split(",");
                        if(keys[1]>keys[4]) color = "green";
                        else color = "darkred";
                        vm.datas.push({
                            date: keys[0],
                            Open: keys[1],
                            High: keys[2],
                            low: keys[3],
                            close: keys[4],
                            volume: keys[5],
                            color: color
                        });
                        if(y_max < +keys[2]) y_max = +keys[2];
                        if(y_low > +keys[3]) y_low = +keys[3];
                    }

                console.log(y_low.toFixed(3));

                vm.options = {
                    chart: {
                        type: 'boxPlotChart',
                        height: 450,
                        margin : {
                            top: 20,
                            right: 20,
                            bottom: 30,
                            left: 50
                        },
                        color:function (d) {return d.color;},
                        x: function(d){return d.label;},
                        //y: function(d){return d.values.Q3;},
                        maxBoxWidth: 100,
                        yDomain: [y_low, y_max],
                        yAxis :{
                            tickFormat:d3.format(',.2f')
                        }
                    }
                };

                //vm.options.chart.yAxis.tickFormat(d3.format(',.2f'));

                for (var i = vm.datas.length-1 ; i >= 0 ; i--){
                    var highs;
                    var lows;
                    if(vm.datas[i].Open > vm.datas[i].close) {
                        highs = vm.datas[i].Open;
                        lows = vm.datas[i].close;
                    }else{
                        lows = vm.datas[i].Open;
                        highs = vm.datas[i].close;
                    }

                    vm.data.push({
                        label:vm.datas[i].date,
                        color:vm.datas[i].color,
                        values:{
                            Q1: lows,
                            Q2: (+highs + +lows)/2,
                            Q3: highs,
                            whisker_low: vm.datas[i].low,
                            whisker_high: vm.datas[i].High,
                        }
                    })
                }
                console.log(vm.data);
            }, 0);
        }
    }
    request(options, callback);
});
