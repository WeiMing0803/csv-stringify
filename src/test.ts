import { stringify } from 'csv-stringify';
import fs from 'fs/promises'; // 使用 fs/promises 模块以支持 Promise API

function generateCsv(delimiter: string, quoteValues: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        const header = ['Name', 'Age', 'City'];
        const records = [
            ['John', 28, new Date('2025-03-01 00:06:29.683')],
            ['Jane', 32, new Date('2025-03-01 00:06:29.683').toString()],
            ['Peter', 22, '2025-03-01 00:06:29.683']
        ];

        // 配置选项
        const options = {
            delimiter: delimiter,          // 自定义分隔符
            quoted: quoteValues,          // 是否全局加引号
            header: true,                 // 包含标题行
            columns: header,               // 定义表头
            cast: {  //自动将 Date 格式化为 YYYY-MM-DDTHH:mm:ss.SSSZ 而不是时间戳。
                date: (value: { toISOString: () => string; }) => value.toISOString(),
            }
        };

        // 使用 stringify 生成 CSV 内容
        stringify(records, options, async (err, output) => {
            if (err) {
                reject(err); // 如果生成 CSV 出现错误，调用 reject
                return;
            }

            try {
                // 保存到文件
                await fs.writeFile('output.csv', output, 'utf8');
                console.log('CSV file created successfully!');
                resolve(); // 完成后调用 resolve
            } catch (writeErr) {
                reject(writeErr); // 写入文件出错时调用 reject
            }
        });
    });
}

// 示例调用
// 使用 "|" 作为分隔符，并对值加引号
generateCsv('|', true)
    .then(() => console.log('CSV generation completed!'))
    .catch(err => console.error('Error generating CSV:', err));

// npx tsc -p ./tsconfig.json && node ./dist/test.js