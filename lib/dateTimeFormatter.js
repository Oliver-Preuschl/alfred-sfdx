"use strict";

function getDateTime() {
  const dateTime = new Date(Date.now());
  return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()}_${dateTime.getHours()}-${dateTime.getMinutes()}-${dateTime.getSeconds()}`;
}

exports.getDateTime = getDateTime;
