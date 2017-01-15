//处理商户上架一件商品的路由
var web3Instance = require('../../public/javascripts/utils/ethereumUtils/web3Instance');
var daoUtils = require('../../public/javascripts/utils/daoUtils/daoUtils');

//web3初始化
var web3 = web3Instance.web3;

/**
 * 返回码说明：
 * 0：成功；
 * 1：失败；
 *
 * @param req
 * phone:手机号码；
 * goodId:商品Id；
 * goodName:商品名称;
 * goodPrice:商品价格；
 *
 * @param res
 * code:状态码
 * error:错误消息
 * result:返回信息
 * txInfo:区块链交易信息
 * requestUrl:请求url的path
 */
module.exports.add = function (req, res) {
    var phone = req.query.phone;
    var goodId = req.query.goodId;
    var goodName = req.query.goodName;
    var goodPrice = req.query.goodPrice;
    console.log("商户手机：" + phone + ";商品Id：" + goodId + ";商品名称：" + goodName + ";商品价格：" + goodPrice);

    global.contractInstance.addGood(phone, goodId, goodName, goodPrice, {
        from: web3.eth.coinbase,
        gas: 1000000
    }, function (error, result) {
        if (!error) {
            var eventAddGood = global.contractInstance.AddGood();
            eventAddGood.watch(function (error, result) {
                var statusCode = result.args.statusCode;
                var message = result.args.message;
                console.log("状态码：" + statusCode + ";消息：" + message);
                if (statusCode == 0) {
                    daoUtils.goodInsert(goodId, goodName, goodPrice, phone);
                }
                var response = {
                    code: statusCode,
                    error: "",
                    result: message,
                    txInfo: result,
                    requestUrl: req.originalUrl
                };
                eventAddGood.stopWatching();
                res.send(JSON.stringify(response));
                res.end();
            });
        }
        else {
            console.error("发生错误：" + error);
            var response = {
                code: 1,
                error: error.toString(),
                result: "",
                txInfo: "",
                requestUrl: req.originalUrl
            };
            res.send(JSON.stringify(response));
            res.end();
        }
    });
};