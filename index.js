const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

let start_destination_latitude = 35.172818;        // 가상의 출발지 위도
let start_destination_longitude = 129.130716;      // 가상의 출발지 경도

let finish_destination_latitude = 35.117301;       // 가상의 도착지 위도
let finish_destination_longitude = 128.968034;     // 가상의 도착지 경도

exports.handler = async (event, context) => {      // event는 요청값(body)
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  // 출발지 위치는 시나리오 1에서 받아와야 하지만 지금은 구현 불가하므로 하드코딩으로 가상의 위도, 경도 생성
  try {
    let requestJSON = event;
    let lat = requestJSON.latitude;
    let lon = requestJSON.longitude;
    
    // startFlag를 받아오기 위해 get을 한번 요청함    
    body = await dynamo
        .get({
          TableName: "DeliveryStatus",
          Key: {
            truckerId: event.truckerId
          }
        })
        .promise();
    
    // 출발지 정보와 현재 드라이버의 위치를 비교해서 운송상태(start) 알림
    // 출발지와 가까워지기만 하면 운송시작 이라고 가정했기 때문에 위,경도 차이를 0.005로 지정    
    if(Math.abs(start_destination_latitude - lat) <= 0.005 && Math.abs(start_destination_longitude - lon) <= 0.005){
      await dynamo
      .put({
        TableName: "DeliveryStatus",
        Item: {
          "truckerId": requestJSON.truckerId,
          "delivery-status": "start",
          "startFlag": 1
          }
      })
      .promise();
    }
    
    // 도착지 정보와 현재 드라이버의 위치를 비교해서 운송상태(finish) 알림
    // 도착지와 거의 근접해야 운송완료이기 때문에 위,경도 차이를 0.0005로 지정    
    if(Math.abs(finish_destination_latitude - lat) <= 0.0005 && Math.abs(finish_destination_longitude - lon) <= 0.0005){
      await dynamo
      .put({
        TableName: "DeliveryStatus",
        Item: {
          "truckerId": requestJSON.truckerId,
          "delivery-status": "finish",
          "startFlag": 0
        }
      })
      .promise();
    }
    // startFlag가 0이면 아직 출발을 안했기 때문에 "preparing"을 반환함
    if(body.Item.startFlag === 0){
          await dynamo
          .put({
            TableName: "DeliveryStatus",
            Item: {
              "truckerId": requestJSON.truckerId,
              "delivery-status": "preparing"
            }
          })
          .promise();
        }
        // startFlag가 1이면 출발을 했기 때문에 "shipping"을 반환함
        else if(body.Item.startFlag === 1){
          await dynamo
          .put({
            TableName: "DeliveryStatus",
            Item: {
              "truckerId": requestJSON.truckerId,
              "delivery-status": "shipping"
            }
          })
          .promise();
        }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  return {
    statusCode,
    body,
    headers
  };
};

// 바꾼 내용이지롱
// 한번더 수정한거지롱
// 안되면 운다 ㄹㅇ
// 마지막으로 확인

// 리전 수정
// 제발 되어주세ㅔ요ㅜㅠㅠㅠㅠ