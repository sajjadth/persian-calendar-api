const { default: axios } = require("axios");
const moment = require("moment-jalaali");
const express = require("express");

var holidaysCache = null;
var eventsCache = null;
var yearCache = {};

let week = new Array("شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه");

const p2e = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

function getFirstDayOfMonthInJalaliCalendar(year, month) {
  let m = moment(`${year}/${month}/1`, "jYYYY/jM/jD");
  return m.format("jYYYY/jM/jD [is] YYYY/M/D").split(" is ")[1];
}

function getMonthLimit(year, month) {
  if (month === 12) {
    if (isLeapYearJalali(year)) return 30;
    return 29;
  } else if (month <= 6) return 31;
  return 30;
}

function isLeapYearJalali(year) {
  const matches = [1, 5, 9, 13, 17, 22, 26, 30];
  const modulus = year % 33;
  return matches.includes(modulus);
}

function getStartOfTheMonthHeader(d, header) {
  header["jalali"] = d.toLocaleDateString("fa-IR-u-nu-latn", {
    month: "long",
  });
  header["miladi"] = d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  let qamari = d
    .toLocaleDateString("ar-SA", {
      month: "long",
      year: "numeric",
    })
    .split(" ");
  if (qamari.length === 4) header["qamari"] = `${qamari[0]} ${qamari[1]} ${qamari[2]}`;
  else if (qamari.length === 3) header["qamari"] = `${qamari[0]} ${qamari[1]}`;
}

function getEndOfTheMonthHeader(d, header) {
  const miladiYear = d.toLocaleDateString("en-US", { year: "numeric" });
  const miladiMonth = d.toLocaleDateString("en-US", { month: "long" });
  if (header["miladi"].includes(miladiYear)) {
    header["miladi"] = `${header["miladi"].split(" ")[0]} - ${miladiMonth}  ${
      header["miladi"].split(" ")[1]
    }`;
  } else {
    header["miladi"] += ` - ${miladiMonth} ${miladiYear}`;
  }

  const qamariYear = d.toLocaleDateString("ar-SA", { year: "numeric" }).split(" ")[0];
  const qamariMonth = d.toLocaleDateString("ar-SA", { month: "long" });

  if (header["qamari"].includes(qamariYear)) {
    const qamariParts = header["qamari"].split(" ");
    if (header["qamari"].split(" ").length === 2)
      header["qamari"] = `${qamariParts[0]} - ${qamariMonth} ${qamariParts[1]}`;
    else if (header["qamari"].split(" ").length === 3)
      header["qamari"] = `${qamariParts[0]} ${qamariParts[1]} - ${qamariMonth} ${qamariParts[2]}`;
  } else {
    header["qamari"] += ` - ${qamariMonth} ${qamariYear}`;
  }
}

function getNumberOfMonthAndDayForHolidays(d, jalali, hijri, gregorian) {
  const options = {
    month: "numeric",
    day: "numeric",
  };
  const enUSLocale = "en-US";
  const arSALocale = "ar-SA-u-nu-latn";
  const faIRLocale = "fa-IR-u-nu-latn";

  const gregorianDate = d.toLocaleDateString(enUSLocale, options);
  gregorian.month = Number(gregorianDate.split("/")[0]);
  gregorian.day = Number(gregorianDate.split("/")[1]);

  const hijriDate = d.toLocaleDateString(arSALocale, options);
  // hijri.month = Number(hijriDate.split("/")[1]);
  hijri["month"] = Number(
    d.toLocaleDateString("ar-SA-u-nu-latn", {
      month: "numeric",
    })
  );
  hijri.day = Number(hijriDate.split("/")[0]);

  const jalaliDate = d.toLocaleDateString(faIRLocale, options);
  jalali.month = Number(jalaliDate.split("/")[0]);
  jalali.day = Number(jalaliDate.split("/")[1]);
}

function setDayEvent(mainDay, events, jalali, hijri, gregorian) {
  const addEventsToList = (eventList) => {
    if (eventList.length !== 0) mainDay.events.list.push(...eventList);
  };

  const checkAndAddEvents = (calendar, month, day) => {
    if (events[calendar]?.[month]?.[day]?.list && events[calendar][month][day].list.length !== 0) {
      if (events[calendar][month][day].isHoliday) {
        mainDay.events.isHoliday = true;
        const ht = mainDay.events.holidayType;
        if (ht && !ht.includes(calendar)) mainDay.events.holidayType += ` - ${calendar}`;
        else mainDay.events.holidayType = calendar;
      }
      addEventsToList(events[calendar][month][day].list);
    }
  };

  checkAndAddEvents("hijri", hijri.month, hijri.day);
  checkAndAddEvents("jalali", jalali.month, jalali.day);
  checkAndAddEvents("gregorian", gregorian.month, gregorian.day);
}

async function getMonth(year, month) {
  const header = {};
  const weeks = [];
  const d = new Date(getFirstDayOfMonthInJalaliCalendar(year, month));

  let startIndex = 1;
  let lengthOfMonth = getMonthLimit(year, month);
  let doneWithStartIndex = false;
  let weekdayLong = d.toLocaleDateString("fa-IR", { weekday: "long" });
  let events = await getAllEvents();
  let hijri = {};
  let gregorian = {};
  let jalali = {};
  let headerIsCompleted = false;

  for (let i = 0; i < 7; i++) {
    if (week[i] === weekdayLong) {
      d.setDate(d.getDate() - i);
      break;
    }
  }

  for (let i = 0; i <= lengthOfMonth; ) {
    const monthNumber = Number(d.toLocaleDateString("fa-IR-u-nu-latn", { month: "numeric" }));
    const day = {};
    weekdayLong = d.toLocaleDateString("fa-IR", { weekday: "long" });
    getNumberOfMonthAndDayForHolidays(d, jalali, hijri, gregorian);

    if (i == 1) getStartOfTheMonthHeader(d, header);
    else if (i == lengthOfMonth && !headerIsCompleted) {
      getEndOfTheMonthHeader(d, header);
      headerIsCompleted = true;
    }

    day["disabled"] = monthNumber != month;
    day["day"] = {
      j: d.toLocaleDateString("fa-IR", { day: "numeric" }),
      m: d.getDate().toString(),
      q: d.toLocaleDateString("ar-SA", { day: "numeric" }),
    };
    day["events"] = {
      isHoliday: false,
      list: [],
      holidayType: "",
    };
    if (!day["disabled"]) {
      setDayEvent(day, events, jalali, hijri, gregorian);
    }
    weeks.push(day);
    if (!day.disabled && Number(p2e(day.day.j)) === 1 && !doneWithStartIndex)
      doneWithStartIndex = true;
    else if (day.disabled && !doneWithStartIndex) startIndex++;
    if (monthNumber === month) i++;
    else if (
      (i === lengthOfMonth && weekdayLong === week[6]) ||
      (i === lengthOfMonth - 1 && weekdayLong === week[6])
    )
      i++;

    d.setDate(d.getDate() + 1);
  }
  return {
    header: header,
    days: weeks,
    startIndex: startIndex - 1,
    lengthOfMonth: lengthOfMonth,
  };
}

function splitEventsInDay(holidayCheck, e, calendarType) {
  let result = [];
  let start = "";
  e.split(" – ").forEach((v) => {
    if (v.split("(").length === v.split(")").length) {
      result.push({
        isHoliday: holidayCheck && result.length === 0,
        event: v,
        calendarType: calendarType,
      });
    } else {
      if (start) {
        let event = start + " " + v;
        result.push({
          isHoliday: holidayCheck && result.length === 0,
          event: event,
          calendarType: calendarType,
        });
        start = "";
      } else {
        start = v;
      }
    }
  });
  return result;
}

async function getJalaliEvents(holidays) {
  let events = {};
  const jalaliEvents = [
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-jalali-data.txt",
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-jalali-2-data.txt",
  ];
  const eventsPromise = jalaliEvents.map(async (link) => {
    const res = await axios.get(link);
    res.data.split("\n").forEach((d) => {
      const check = Number(d.slice(0, 2));
      if (check > 0 && check < 13) {
        const event = d.split("\t")[1];
        const month = Number(d.split("\t")[0].split("/")[0]);
        const day = Number(d.split("\t")[0].split("/")[1]);
        const { jalali } = holidays;
        let holidayCheck = false;
        if (!events.hasOwnProperty(month)) events[month] = {};
        if (!events[month].hasOwnProperty(day)) events[month][day] = { isHoliday: false, list: [] };
        if (link === jalaliEvents[0] && jalali?.[month]?.includes(day < 10 ? "0" + day : day)) {
          events[month][day].isHoliday = true;
          holidayCheck = true;
        }
        const e = splitEventsInDay(holidayCheck, event, "jalali");
        events[month][day].list.push(...e);
      }
    });
  });
  await Promise.all([...eventsPromise]);
  return events;
}

async function getGregorianEvents() {
  let events = {};
  const gregorianEvents = [
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-gregorian-data.txt",
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-gregorian-2-data.txt",
  ];
  const eventsPromise = gregorianEvents.map(async (link) => {
    const res = await axios.get(link);
    res.data.split("\n").forEach((d) => {
      const check = Number(d.slice(0, 2));
      if (check > 0 && check < 13) {
        const event = d.split("\t")[1];
        const month = Number(d.split("\t")[0].split("/")[0]);
        const day = Number(d.split("\t")[0].split("/")[1]);
        if (!events.hasOwnProperty(month)) events[month] = {};
        if (!events[month].hasOwnProperty(day)) events[month][day] = { isHoliday: false, list: [] };
        const e = splitEventsInDay(false, event, "gregorian");
        events[month][day].list.push(...e);
      }
    });
  });
  await Promise.all([...eventsPromise]);
  return events;
}

async function getHijriEvents(holidays) {
  let events = {};
  const hijriEvents = [
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-hijri-data.txt",
    "https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-hijri-2-data.txt",
  ];
  hijriEvents.map(async (link) => {
    const res = await axios.get(link);
    res.data.split("\n").forEach((d) => {
      const check = Number(d.slice(0, 2));
      if (check > 0 && check < 13) {
        const event = d.split("\t")[1];
        const month = Number(d.split("\t")[0].split("/")[0]);
        const day = Number(d.split("\t")[0].split("/")[1]);
        const { hijri } = holidays;
        let holidayCheck = false;
        if (!events.hasOwnProperty(month)) events[month] = {};
        if (!events[month].hasOwnProperty(day)) events[month][day] = { isHoliday: false, list: [] };
        if (link === hijriEvents[0] && hijri?.[month]?.includes(day < 10 ? "0" + day : day)) {
          events[month][day].isHoliday = true;
          holidayCheck = true;
        }
        const e = splitEventsInDay(holidayCheck, event, "hijri");
        events[month][day].list.push(...e);
      }
    });
  });

  return events;
}

async function getHolidays() {
  if (holidaysCache) return holidaysCache;
  let holidays = { hijri: {}, jalali: {} };
  const holidayPromise = axios
    .get("https://raw.githubusercontent.com/ilius/starcal/master/plugins/holidays-iran.json")
    .then((res) => {
      res.data.holidays.jalali.forEach((h) => {
        const num = h[1] < 10 ? "0" + h[1] : h[1];
        if (!holidays.jalali.hasOwnProperty(h[0])) holidays.jalali[h[0]] = [];
        holidays.jalali[h[0]].push(num);
      });
      res.data.holidays.hijri.forEach((h) => {
        const num = h[1] < 10 ? "0" + h[1] : h[1];
        if (!holidays.hijri.hasOwnProperty(h[0])) holidays.hijri[h[0]] = [];
        holidays.hijri[h[0]].push(num);
      });
    });
  await Promise.all([holidayPromise]);
  holidaysCache = holidays;
  return holidays;
}

async function getAllEvents() {
  if (eventsCache) return eventsCache;
  let holidays = await getHolidays();
  let jalali = await getJalaliEvents(holidays);
  let hijri = await getHijriEvents(holidays);
  let gregorian = await getGregorianEvents();
  eventsCache = { jalali: jalali, gregorian: gregorian, hijri: hijri };
  return eventsCache;
}

async function getCalendar(y, m) {
  console.time("getCalendar");
  if (yearCache.hasOwnProperty(y)) {
    console.timeEnd("getCalendar");
    if (m) return yearCache[y][m - 1];
    return yearCache[y];
  }
  if (m) return await getMonth(y, m);
  let year = [];
  for (let i = 1; i <= 12; i++) {
    let weeks = await getMonth(y, i);
    year.push(weeks);
  }
  console.timeEnd("getCalendar");
  yearCache[y] = year;
  return year;
}

const app = express();
const port = 5000;
app.get("/", async (req, res) => {
  const { query } = req;
  const thisYear = Number(new Date().toLocaleDateString("fa-IR-u-nu-latn", { year: "numeric" }));
  const y = Number(query.year);
  const year = !y || (y < 1300 && y > 1500) ? thisYear : Number(query.year);
  const month =
    query.month && Number(query.month) >= 1 && Number(query.month) <= 12
      ? Number(query.month)
      : false;
  res.json(await getCalendar(year, month));
});
app.listen(port, async () => {
  console.time("getALlEvents");
  await getAllEvents();
  console.timeEnd("getALlEvents");
  console.log(`Persian Calendar API is Up and Running in Port: ${port}`);
});
