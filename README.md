# Persian Calendar API

This repository contains a Node.js API that provides a Persian (Jalali) calendar with holiday events. The API allows you to retrieve calendars for specific years and months.

## Requirements

To run this application, you need to have the following installed on your system:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory in the terminal.
3. Install the required dependencies by running the following command:
    ```
    npm install
    ```

## Usage

To start the server and access the Persian calendar API, use the following command:

    npm start

To run the server in development mode with nodemon for automatic restarts during development, you can use:

    npm run dev

The server will be running on port 5000 by default. You can change the port in the `index.js` file if needed.

## Endpoints

`GET /`
Returns the calendar for a specific year and month.

## Parameters

- `year` (optional): The year in the Jalali calendar format (e.g., 1400). If not provided, the current year will be used.
- `month` (optional): The month in the Jalali calendar format (1 to 12). If not provided, the entire calendar for the year will be returned.

## Example Usage:

- To get the calendar for the current year:
  ```
  curl http://localhost:5000/
  ```
- To get the calendar for the year 1400 (2021 in Gregorian):
  ```
  curl http://localhost:5000/?year=1400
  ```
- To get the calendar for the month of Farvardin (the first month) in the year 1400:
  ```
  curl http://localhost:5000/?year=1400&month=1
  ```
## Accessing the Persian Calendar API

You can access the Persian Calendar API by making HTTP requests to the following endpoint:

```
GET https://persian-calendar-api.sajjadth.workers.dev/
```
This endpoint allows you to retrieve the calendar for a specific year and month.

- To get the calendar for the current year:
    ```
    curl https://persian-calendar-api.sajjadth.workers.dev/ 
    ```
- To get the calendar for the year 1400 (2021 in Gregorian):
    ```
    curl https://persian-calendar-api.sajjadth.workers.dev/?year=1400
    ```
- To get the calendar for the month of Farvardin (the first month) in the year 1400:
    ```
    curl https://persian-calendar-api.sajjadth.workers.dev/?year=1400&month=1
    ```

## Note

The API supports years from 1300 to 1500 in the Jalali calendar.

## Third-Party Data Sources

All third-party data sources used by the Persian Calendar API are from the [starcal](https://github.com/ilius/starcal) repository. The following data sources have been integrated:

- [iran-jalali-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-jalali-data.txt)
- [iran-jalali-2-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-jalali-2-data.txt)
- [iran-gregorian-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-gregorian-data.txt)
- [iran-gregorian-2-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-gregorian-2-data.txt)
- [iran-hijri-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-hijri-data.txt)
- [iran-hijri-2-data.txt](https://raw.githubusercontent.com/ilius/starcal/master/plugins/iran-hijri-2-data.txt)
- [holidays-iran.json](https://raw.githubusercontent.com/ilius/starcal/master/plugins/holidays-iran.json)

These data sources contribute additional holiday information for specific years and months in the Persian calendar, allowing users to access a more comprehensive and accurate list of holidays and events.

We would like to express our gratitude to the maintainers of the [starcal](https://github.com/ilius/starcal) repository for providing valuable holiday data and enhancing the functionality of our Persian Calendar API.

Please note that the integration of third-party data sources might entail periodic updates to ensure the API's accuracy and completeness. We will strive to maintain the API and update these data sources regularly to provide the best possible user experience. If you encounter any issues or have suggestions related to these third-party data sources, please feel free to open an issue or contribute to the project. Your support and contributions are highly appreciated!

Thank you for using the Persian Calendar API! We hope it serves your needs effectively and brings you a reliable source of Persian calendar and holiday information.


## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

