// Referenced at https://walkingmask.hatenablog.com/entry/2018/04/26/011611
//               

//グローバル変数
var CHANNEL_ACCESS_TOKEN = '';
var LINE_ENDPOINT = 'https://api.line.me/v2/bot/message/';



// ポスト処理
function doPost(e) {
  var json = JSON.parse(e.postData.contents);　
  
  if (json.events[0].message.type = 'image') {　//メッセージタイプ判断
    var contents = get_line_content(json.events[0].message.id);　//コンテンツ取得関数
    var text = ocr(contents);　//OCR処理関数
    reply(json, text);　//LINEへの返信処理
  }else{
    text ="こちらは画像ではありません。文字入りの画像を送ると解析してテキストにしてお返しします。"
    replyToLine(json, text);
    }
}


// コンテンツ取得処理
function get_line_content(messageId) {
  var headers = {
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
  };
  var options = {
    'method'  : 'GET',
    'headers': headers
  };
  var url = LINE_ENDPOINT + messageId + '/content';
  var contents = UrlFetchApp.fetch(url, options).getBlob();
  return contents;
}

// OCRの実行
function ocr(contents) {
  var resource = {
    title: contents.getName(),
    mimeType: contents.getContentType()
  };
  var options = {
    ocr: true
  };
  try {
    var imgFile = Drive.Files.insert(resource, imgBlob, options); //画像ファイルをGoogle Driveに格納
    var doc = DocumentApp.openById(imgFile.id); 
    var text = doc.getBody().getText().replace("\n", ""); //OCR結果の取得
    var res = Drive.Files.remove(imgFile.id); //ファイルの削除
  } catch(e) {
    return '読み取りに失敗しました';
  }
  return text;

}

//返信
function replyToLine(data, text) {
  
  var url = LINE_ENDPOINT+ 'reply';
  var headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ CHANNEL_ACCESS_TOKEN,
  };
  var postData = {
    'replyToken' : data.events[0].replyToken,
    'messages'   : [
      {
        'type': 'text',
        'text': text,
      }
    ]
  };
  var options = {
    'method'  : 'POST',
    'headers' : headers,
    'payload' : JSON.stringify(postData)
  };
  
  return UrlFetchApp.fetch(url, options);  
}

