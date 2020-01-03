# umeng-stats-sdk
umeng statistics sdk

## usage
### install 
`npm install umeng-stats-sdk`
### create instance
```
const UmengStatsSDK = require("umeng-stats-sdk);
const inst = new UmentStatsSDK({
  //required, acquired from umeng
  apiKey: "123456",
  //required, acquired from umeng
  apiSecurity: "abcdefgh",
  //optional
  appkey: "q1w32we3r4t5t5y6",
  //required, specified your action
  event: "umeng.uapp.getAllAppData",
  //optional, see umeng sdk
  params: {
    page: 1,
    pageSize: 10
  }
});
```
