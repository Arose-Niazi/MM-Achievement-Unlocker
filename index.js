const mysql = require('mysql');

require('dotenv').config();

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DATABASE,
});

let djs = ['Sasuke_Uchiha', 'Commander_Steel'];

let achievements = [];
const Queries = [
	"SELECT p_ID, 69 As Ach_ID FROM user_accounts INNER JOIN missions_data AS m ON p_UserName = m_MapBy GROUP BY p_ID;",
	"SELECT s.p_ID ,6 As Ach_ID FROM user_stats AS s WHERE s.m_ID = 37 AND s.p_MissionWon > 0 GROUP BY p_ID",
	"SELECT s.p_ID ,7 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_TypeName = 'Last Man Standing' GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,29 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 2 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 49",
	"SELECT s.p_ID ,32 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type IN (0,7) GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,32 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 0 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,32 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 7 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,34 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_TypeName = 'Survive On Luck' GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 9",
	"SELECT s.p_ID ,34 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_TypeName = 'Survive On Luck' GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 19",
	"SELECT p_ID,42 As Ach_ID, SUM(REGEXP_REPLACE(REPLACE(a.Text, 'Gave $', ''),'[ to].+', '')) AS Cash FROM user_actions AS a WHERE a.Text LIKE 'Gave $%%to%%' GROUP by a.p_ID HAVING Cash > 49999",
	"SELECT a.p_ID,43 As Ach_ID, SUM(REGEXP_REPLACE(REPLACE(a.Text, 'Gave ', ''),'[ to].+', '')) AS Cookies FROM user_actions AS a WHERE a.Text LIKE 'Gave %%Cookie(s) to%%' GROUP by a.p_ID HAVING Cookies > 99",
	"SELECT a.p_ID,52 As Ach_ID FROM user_actions AS a WHERE a.Text LIKE 'Kicked by %%' GROUP by a.p_ID HAVING Count(ID) > 4",
	"SELECT a.p_ID,53 As Ach_ID FROM user_actions AS a WHERE a.Text LIKE 'Player jailed for %%' GROUP by a.p_ID HAVING Count(ID) > 4",
	"SELECT s.p_ID ,57 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 15 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 9",
	"SELECT p_ID ,71 As Ach_ID FROM user_stats GROUP BY p_ID HAVING SUM(p_TimePlayed) > 525600",
	"SELECT s.p_ID ,77 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 3 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,78 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 1 GROUP BY s.p_ID HAVING SUM(s.p_MissionWon) > 99",
	"SELECT s.p_ID ,84 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 6 GROUP BY s.p_ID HAVING SUM(s.p_MissionPassed) > 349",
	"SELECT s.p_ID ,85 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 6 GROUP BY s.p_ID HAVING SUM(s.p_MissionPassed) > 399",
	"SELECT s.p_ID ,86 As Ach_ID FROM user_stats AS s INNER JOIN missions_data AS m ON m.m_ID = s.m_ID WHERE m.m_Type = 6 GROUP BY s.p_ID HAVING SUM(s.p_MissionPassed) > 499"

];

let TotalDone = 0;

connection.connect();

connection.query('SELECT Ach_ID, Title_ID, Toy_ID FROM achievements_data', function (error, results) {
	if (error) throw error;
	achievements = results;
	checkUnlocked();
});

async function checkUnlocked() {
	for (let index = 0; index < Queries.length; index++) {
		const element = Queries[index];
		connection.query(element, async function (error, results) {
			if (error) throw error;
			await UnlockAch(results);
			TotalDone++;

			EndConnection();
		});
	}

	connection.query("SELECT p_ID,75 AS Ach_ID FROM user_accounts WHERE p_UserName IN (?)", [djs], async function (error, results) {
		if (error) throw error;
		console.log(results);
		await UnlockAch(results);
		TotalDone++;

		EndConnection();
	});
}

async function UnlockAch(data) {
	if (data.length < 1) return;

	const ach = achievements.find((e) => e.Ach_ID == data[0].Ach_ID);

	let ach_query = "INSERT IGNORE INTO user_achs VALUES ";
	let toy_query = "INSERT IGNORE INTO user_toys VALUES ";
	let title_query = "INSERT IGNORE INTO user_titles VALUES ";

	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		ach_query += `('${element.p_ID}', ${ach.Ach_ID}),`;

		toy_query += `('${element.p_ID}', ${ach.Toy_ID}),`;

		title_query += `('${element.p_ID}', ${ach.Title_ID}),`;
	}

	ach_query = ach_query.slice(0, -1) + ";";
	toy_query = toy_query.slice(0, -1) + ";";
	title_query = title_query.slice(0, -1) + ";";

	await connection.query(ach_query);
	if (ach.Toy_ID)
		await connection.query(toy_query);
	if (ach.Title_ID)
		await connection.query(title_query);
}

function EndConnection() {
	if (TotalDone == Queries.length + 1)
		connection.end();
}
