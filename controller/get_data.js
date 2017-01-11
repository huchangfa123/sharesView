var app = angular.module('myApp', ['ui.bootstrap','ui.router','nvd3']);
var request = require('request');
const http = require("http");
var iconv = require('iconv-lite');
var d3 = require('d3');


app.controller('dataCtrl', function($rootScope,$scope,$state,$timeout,$q,share_data) {

    var requrl = "http://127.0.0.1:5000/gpdmylb.html";//用于爬股票号码的网址
    var content;
    var data_base=[];

    $scope.show_data=[];
    $scope.fail_url=[];
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.contentSize = 20;
    $scope.totalItems = 1880;
    $scope.c_data = [];
    $scope.class = 'all';

    function climb_data(url) {
        return new Promise( function (resolve) {
        return http.get(url, function (res) {
            var html = "";
            var save_array = [];
            res.on("data", (data) => {
                html += iconv.decode(data,'GB2312');
            });
            res.on("end", ()=> {
                save_array = html.split(',');
                $scope.$apply(() => {
                    if (save_array[30] != 'undefined' && save_array[3]!= null && save_array[3] !=0)
                        data_base.push({
                            place: save_array[0].substring(11,13),
                            number: save_array[0].substring(13,19),
                            name: save_array[0].substr(21),
                            opening_price: save_array[1],
                            yesterday_ending_price: save_array[2],
                            now_price: save_array[3],
                            deal_shares: save_array[8]/100,
                            deal_moneys: save_array[9],
                            updata_time: save_array[30] +" "+ save_array[31],
                            id:null
                        });
                }, 0);
                //console.log(data_base[data_base.length-1]);
                resolve();
            })
        }).on("error", (e)=> {
            var promises = [];
            //console.log(url + ` 获取数据失败: ${e.message}`);
            $scope.fail_url.push(url);
            for(var n = 0; n < $scope.fail_url.length; n++)
            {
                promises.push(climb_data($scope.fail_url[n]));
                $scope.fail_url.shift();
            }
            $q.all(promises).then(()=>{
                resolve();
            })
            //if( $scope.fail_url.length == 0) console.log("all climb!")
        })
    });
    }

    $scope.pageChange = function(){
        //console.log($scope.currentPage);
        //console.log($scope.c_data);
        var counter = 0;
        var begin = $scope.currentPage-1;
        $scope.show_data=[];
        for(var i = begin * 20; i < begin*20 + 20 ; i++)
        {
            //console.log(data_base[i]);
            if(i >= $scope.c_data.length) break;
            $scope.c_data[i].id = counter;
            $scope.show_data[counter] = $scope.c_data[i];
            //console.log($scope.show_data[counter]);
            counter++;
        }
    }

    //获取股票的号码，地点
    function climb_number() {
        var promises = [];
        request(requrl, function (error, response, body) {
            if(!error&&response.statusCode == 200){
                content = body;
                var res = content.match(/([A-Z]{2}\d{6})/g);
                for (var i = 0; i < res.length; i++) {
                    //console.log(i);
                    //所有地址获取其股票数据
                    if(res[i].length == 8) {
                        var url = "http://hq.sinajs.cn/list=" + res[i].toLowerCase();
                    }
                    else
                        break;
                    promises.push(climb_data(url));
                }
                $q.all(promises).then(()=>{
                    console.log('success climb!');
                    $scope.c_data = data_base;
                    $scope.pageChange();
                });
            }
        });
    }

    $scope.click = function () {
        var id = angular.element(this)[0].x.id;
        //console.log($scope.show_data[id].img);
        share_data.individual = $scope.show_data[id];
        var place = $scope.show_data[id].place;
        if (place === 'sh') place = 'ss';
        else place = 'sz';
        var url = `http://127.0.0.1:5000/table.csv?s=${$scope.show_data[id].number}.${place}`;
        console.log(url);
        var options = {
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': 'request'
            }
        };

        function callback(error, response, body) {
            console.log(body);
            if(body === 'ERROR'){
                alert("数据获取失败，请选择其他股票");
            }
            else if(!error && response.statusCode == 200) {
                $state.go('individual');
            }
        }
        request(options, callback);
    }
    
    $scope.c_shanghai=function () {
        $scope.class = 'sh';
        $scope.c_data = [];
        for(let i = 0 ;i < data_base.length; i ++) {
            if(data_base[i].place == $scope.class) {
                $scope.c_data.push(data_base[i]);
            }
        }
        $scope.totalItems = $scope.c_data.length;
        share_data.init_data =  $scope.c_data;
        $scope.pageChange();
    }

    $scope.c_shenzhen=function () {
        $scope.class = 'sz';
        $scope.c_data = [];
        for(let i = 0 ;i < data_base.length; i ++) {
            if(data_base[i].place === $scope.class) {
                $scope.c_data.push(data_base[i]);
            }
        }
        $scope.totalItems = $scope.c_data.length;
        share_data.init_data =  $scope.c_data;
        $scope.pageChange();
    }

    $scope.c_all=function () {
        $scope.class = 'all';
        $scope.c_data = [];
        $scope.c_data = data_base;
        share_data.init_data =  $scope.c_data;
        $scope.totalItems = 1880;
        $scope.pageChange();
    }

    if(data_base.length == 0)
        climb_number();
    else{
        $scope.c_data = share_data.init_data;
        $scope.totalItems = $scope.c_data.length;
        $scope.pageChange();
    }
});
