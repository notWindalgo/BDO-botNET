function week(){
  var date = new Date();
  //
  var dateDay = date.getDay();
  var dateYear = date.getYear();
  var dateMonth = date.getMonth();
  //
  var dateWeek = new Date(new Date().setDate(new Date().getDate()-dateDay));
  var dateWeekYear = dateWeek.getYear();
  var dateWeekMonth = dateWeek.getMonth();
  var dateWeekDay = dateWeek.getDate();
  //
  var queryDateWeek = ((dateWeekYear + 1900) + "-" + (dateWeekMonth + 1) + "-" + dateWeekDay);
  return queryDateWeek;
}

function month(){
  var date = new Date();
  //
  var dateDay = date.getDay();
  var dateYear = date.getYear();
  var dateMonth = date.getMonth();
  //
  var dateMonth = new Date(new Date().setDate(new Date().getDate()-30));
  var dateMonthYear = dateMonth.getYear();
  var dateMonthMonth = dateMonth.getMonth();
  var dateMonthDay = dateMonth.getDate();
  //
  var queryDateMonth = ((dateMonthYear + 1900) + "-" + (dateMonthMonth + 1) + "-" + dateMonthDay);
  return queryDateMonth;
}

function dynamic(x){
  var date = new Date();
  //
  var dateDay = date.getDay();
  var dateYear = date.getYear();
  var dateMonth = date.getMonth();
  //
  var dateMonth = new Date(new Date().setDate(new Date().getDate()-x));
  var dateMonthYear = dateMonth.getYear();
  var dateMonthMonth = dateMonth.getMonth();
  var dateMonthDay = dateMonth.getDate();
  //
  var queryDateMonth = ((dateMonthYear + 1900) + "-" + (dateMonthMonth + 1) + "-" + dateMonthDay);
  return queryDateMonth;
}


module.exports = {
  week: week,
  month: month,
  dynamic: dynamic,
}
