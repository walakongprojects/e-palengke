const urlProd = 'https://e-palengke.herokuapp.com'
const urlDev = 'http://localhost:2000'

module.exports = {
  // old
  // client_id : 'AQKFyQ5slFTCzJK4ptOlf-KApv1K4eczFM5ILeifN9FXLs8amP-k9uTj9Msj9LgTUwPbDMFTnhuDw3ZM',
  // client_secret : 'EFLnIV3aRBUu3clfkoeQZK3YwaJ3EsZwTZGfTCXXtN9yoer42rptHtt7onnDDTilB4bq6NL9qlH59fvZ',

  // new
  client_id : 'AU9aLp7a7OW5e3MqqKZZ2dFMZHu1J2OtchF5YAFcqArUC5wtLj3sEyr_WCHatX6xxfNIYgVraLXCH4Gv',
  client_secret : 'EAtEDB1GLaSz6nvnocfe7yO3sJRulNgFN5eGHFY9yUKosDEV8Q5krh2UUxF1MA7sDFRWJp43kBTc0XMT',
  urlProd,
  urlDev,

  // dev
  success_url : 'http://localhost:2000/cart/success',
  cancel_url : 'http://localhost:2000/cart/cancel',

  // prod
  // success_url : `${urlProd}/cart/success`,
  // cancel_url : `${urlProd}/cart/cancel`
}