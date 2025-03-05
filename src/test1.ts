import { stringify } from 'csv-stringify';
import * as fs from 'fs';
import * as path from 'path';

export type ReportDetails = {
  filename: string;
  directory?: string;
  format: string;
  formatOptions?: {
    delimiter: string;
    quoteValues: boolean;
  };
  result: any;
};

async function generateCsvReport(
  reportDetails: ReportDetails,
): Promise<string> {
  try {
    let filepath: string = reportDetails.directory
      ? path.join(`${reportDetails.directory}/${reportDetails.filename}`)
      : `${reportDetails.filename}`;
    filepath = path.join(`${__dirname}/${filepath}`);

    const data: any[] = reportDetails.result;

    if (!data || data.length === 0) {
      // 如果没有数据，写入 "No Results Found"
      fs.writeFileSync(filepath, "No Results Found");
    } else {
      // 默认的分隔符和引用选项
      const defaultDelimiter = ',';
      const defaultQuoteValues = false;

      const delimiter = reportDetails.formatOptions?.delimiter || defaultDelimiter;
      const quoteValues = reportDetails.formatOptions?.quoteValues ?? defaultQuoteValues;

      /**
       * Each row data can have different header names, example:
       * [
       *  {
       *      "header1": "data1",
       *      "header2": "data2"
       *  },
       *  {
       *      "header1": "data3",
       *      "header3": "data4"
       *  }
       * ]
       * Therefore, we need to ensure that the final header of the csv file has all the different headers
       */
      let finalHeaders: string[] = [];
      for (const d of data) {
        for (const header of Object.keys(d)) {
          if (!finalHeaders.includes(header)) {
            finalHeaders.push(header);
          }
        }
      }

      // 构建 CSV 文件内容
      const rows: Array<string[]> = [];
      rows.push(finalHeaders); // 第一行是表头
      for (const row of data) {
        const rowData: string[] = finalHeaders.map((header) => {
          return row[header] !== undefined ? String(row[header]) : ''; // 填充空值为 ''
        });
        rows.push(rowData);
      }

      // 使用 csv-stringify 将数据写入文件
      await new Promise<void>((resolve, reject) => {
        stringify(
          rows,
          {
            delimiter: delimiter,
            quoted: quoteValues, // 如果 quoteValues 为 true，则所有值都会被引号包裹
          },
          (err, output) => {
            if (err) {
              return reject(err);
            }
            fs.writeFile(filepath, output, (writeErr) => {
              if (writeErr) {
                return reject(writeErr);
              }
              resolve();
            });
          },
        );
      });

      console.log(`Results successfully written into ${filepath}.`);
    }

    return filepath;
  } catch (error: any) {
    throw new Error(error);
  }
}

const reportDetails: ReportDetails = {
    filename: 'test-report.csv',
    directory: './reports',
    format: 'text/csv',
    formatOptions: {
      delimiter: '|',
      quoteValues: true,
    },
    result: [
      { Name: 'John', Age: 28, City: 'New \n\n York' },
      { Name: 'Jane', Age: 32, City: 'London' },
      { Name: 'Peter', Age: 22, City: 'Berlin' },
    ],
  };
  
generateCsvReport(reportDetails)
    .then((filepath) => console.log(`Report generated at: ${filepath}`))
    .catch((err) => console.error(`Error: ${err.message}`));

// npx tsc -p ./tsconfig.json && node ./dist/test1.js