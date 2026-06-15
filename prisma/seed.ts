import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import * as ws from "ws";

neonConfig.webSocketConstructor = ws.WebSocket ?? ws.default ?? ws;

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  await prisma.planEvent.deleteMany();
  await prisma.plan.deleteMany();

  const plan = await prisma.plan.create({
    data: {
      name: "2028年マイホーム購入プラン",
      birthYearSelf: 1997,
      birthYearSpouse: 1997,
      birthYearChild1: 2024,
      birthYearChild2: 2025,
      initialCash: 100,
      initialInvestment: 200,
      baseSalaryself: 450,
      baseSalarySpouse: 300,
      pensionSelf: 180,
      pensionSpouse: 200,
      pensionAgeSelf: 65,
      pensionAgeSpouse: 65,
      retirementAgeSelf: 65,
      retirementAgeSpouse: 65,
      annualLivingCost: 348,
      annualHousingCost: 219,
      annualInsurance: 12,
      investmentRate: 3.0,
    },
  });

  // PDFから読み取ったイベント
  // 各フィールドは「その年以降に累積加算」するデルタ値
  // educationCost・childAllowance等の初期値は0なので、初年度分も明示的にイベントで設定する
  const events: Array<{
    ageSelf: number;
    title: string;
    note?: string;
    salaryChangeSelf: number;
    salaryChangeSpouse: number;
    temporaryIncome: number;
    eventExpense: number;
    nisaChange: number;
    carCostChange: number;
    mortgageDeduction: number;
    childAllowanceChange: number;
    educationCostChange: number;
    loanRepaymentChange: number;
  }> = [
    // 29歳(2026): 初期値設定
    // 教育費10、児童手当36、NISA60、車費5、借入金返済52をデルタとして開始
    {
      ageSelf: 29,
      title: "初期設定",
      note: "教育費・児童手当・NISA・車費・借入金返済の初期値",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 0,
      temporaryIncome: 10,  // 臨時収入10（毎年発生するが単年なのでここでは初年度分のみ）
      eventExpense: 0,
      nisaChange: 60,        // NISA 0→60
      carCostChange: 5,      // 車費 0→5
      mortgageDeduction: 0,
      childAllowanceChange: 36, // 児童手当 0→36
      educationCostChange: 10,  // 教育費 0→10
      loanRepaymentChange: 52,  // 借入金返済 0→52
    },
    // 30歳(2027): 引越し・車購入、理奈育休復帰
    // 理奈収入300→540(+240)、住宅関連費219→269(+50)、車費5→71(+66)、児童手当36→30(-6)
    {
      ageSelf: 30,
      title: "引越し・車購入・理奈育休復帰",
      note: "理奈収入+240、住宅関連費+50、車費+66、児童手当-6",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 240,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 66,         // 5→71
      mortgageDeduction: 0,
      childAllowanceChange: -6,  // 36→30
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 31歳(2028): マイホーム購入
    // 住宅関連費269→217(-52)、住宅ローン控除+56、借入金返済52→52(変化なし)
    // 理奈収入540→541(+1)、生活費348→360(+12)
    {
      ageSelf: 31,
      title: "マイホーム購入",
      note: "住宅関連費-52、住宅ローン控除56、生活費+12",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 56,     // 1年目56万控除
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 32歳(2029): 奏空小学校入学
    // 住宅ローン控除56→28(-28)、児童手当30→24(-6)、教育費10→15(+5)
    // 借入金返済52→16(-36)、雅也収入+5
    {
      ageSelf: 32,
      title: "奏空 小学校入学",
      note: "ローン控除28/年へ減額、借入金返済-36、教育費+5",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: -28,    // 56→28
      childAllowanceChange: -6,  // 30→24
      educationCostChange: 5,    // 10→15
      loanRepaymentChange: -36,  // 52→16
    },
    // 33歳(2030): 日向小学校入学
    // 教育費15→20(+5)、雅也+4、理奈+1
    {
      ageSelf: 33,
      title: "日向 小学校入学",
      note: "教育費+5",
      salaryChangeSelf: 4,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 5,    // 15→20
      loanRepaymentChange: 0,
    },
    // 34歳(2031): 海外旅行
    // 教育費20→50(+30)、生活費360→372(+12)、雅也+5
    {
      ageSelf: 34,
      title: "海外旅行",
      note: "教育費+30、生活費+12",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 30,   // 20→50
      loanRepaymentChange: 0,
    },
    // 35歳(2032): 生活費・教育費増
    // 生活費372→384(+12)、教育費50→80(+30)
    {
      ageSelf: 35,
      title: "生活費・教育費増",
      note: "生活費+12、教育費+30",
      salaryChangeSelf: 4,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 30,   // 50→80
      loanRepaymentChange: 0,
    },
    // 36歳(2033): NISA増額
    // NISA 60→120(+60)、雅也+5
    {
      ageSelf: 36,
      title: "NISA増額",
      note: "NISA 60→120万/年",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 60,            // 60→120
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 37歳(2034): 海外旅行（雅也+5、理奈+1のみ）
    {
      ageSelf: 37,
      title: "海外旅行",
      note: "",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 40歳(2037): 奏空中学校入学
    // 生活費384→402(+18)、教育費80→90(+10)
    {
      ageSelf: 40,
      title: "奏空 中学校入学",
      note: "生活費+18、教育費+10",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 10,   // 80→90
      loanRepaymentChange: 0,
    },
    // 41歳(2038): 日向中学校入学・10年メンテナンス・車買い替え
    // 生活費402→420(+18)、教育費90→100(+10)、臨時収入110、車費71→335(+264)
    {
      ageSelf: 41,
      title: "日向 中学校入学・10年メンテナンス",
      note: "生活費+18、教育費+10、臨時収入110、車費+264",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 110,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 264,        // 71→335
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 10,   // 90→100
      loanRepaymentChange: 0,
    },
    // 42歳(2039): 車コスト正常化・奏空高校入学
    // 車費335→35(-300)、教育費100→120(+20)
    {
      ageSelf: 42,
      title: "奏空 高校入学・車コスト正常化",
      note: "教育費+20、車費335→35",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: -300,       // 335→35
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 20,   // 100→120
      loanRepaymentChange: 0,
    },
    // 44歳(2041): 日向高校入学・住宅ローン控除終了・児童手当終了
    // 教育費120→150(+30)、ローン控除28→0(-28)、児童手当24→0(-24)
    {
      ageSelf: 44,
      title: "日向 高校入学・住宅ローン控除終了",
      note: "教育費+30、ローン控除終了、児童手当終了",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: -28,    // 28→0
      childAllowanceChange: -24, // 24→0
      educationCostChange: 30,   // 120→150
      loanRepaymentChange: 0,
    },
    // 45歳(2042): 奏空大学入学
    // 教育費150→200(+50)
    {
      ageSelf: 45,
      title: "奏空 大学入学",
      note: "教育費+50",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 50,   // 150→200
      loanRepaymentChange: 0,
    },
    // 46歳(2043): 日向大学入学
    // 生活費420→384(-36)、教育費200→250(+50)
    {
      ageSelf: 46,
      title: "日向 大学入学",
      note: "教育費+50、生活費-36",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 50,   // 200→250
      loanRepaymentChange: 0,
    },
    // 47歳(2044): 海外旅行
    // 教育費250→300(+50)
    {
      ageSelf: 47,
      title: "海外旅行",
      note: "教育費+50",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 50,   // 250→300
      loanRepaymentChange: 0,
    },
    // 49歳(2046): 奏空就職
    // 教育費300→150(-150)
    {
      ageSelf: 49,
      title: "奏空 就職",
      note: "教育費-150",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: -150, // 300→150
      loanRepaymentChange: 0,
    },
    // 50歳(2047): 20年メンテナンス・車買い替え
    // 車費35→335(+300)
    {
      ageSelf: 50,
      title: "20年メンテナンス・車買い替え",
      note: "車費35→335",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 300,        // 35→335
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 51歳(2048): 日向就職・車コスト正常化
    // 教育費150→0(-150)、車費335→35(-300)、臨時収入150
    {
      ageSelf: 51,
      title: "日向 就職・車コスト正常化",
      note: "教育費→0、車費335→35、臨時収入150",
      salaryChangeSelf: 5,
      salaryChangeSpouse: 1,
      temporaryIncome: 150,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: -300,       // 335→35
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: -150, // 150→0
      loanRepaymentChange: 0,
    },
    // 54歳(2051): 奏空結婚
    {
      ageSelf: 54,
      title: "奏空 結婚",
      note: "",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 56歳(2053): 日向結婚
    {
      ageSelf: 56,
      title: "日向 結婚",
      note: "",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 57歳(2054): 30年メンテナンス・車買い替え
    // 車費35→335(+300)
    {
      ageSelf: 57,
      title: "30年メンテナンス・車買い替え",
      note: "車費35→335",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 300,        // 35→335
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 58歳(2055): 車コスト正常化
    // 車費335→35(-300)
    {
      ageSelf: 58,
      title: "車コスト正常化",
      note: "車費335→35",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: -300,       // 335→35
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 63歳(2060): 車買い替え
    {
      ageSelf: 63,
      title: "車買い替え",
      note: "車費35→335",
      salaryChangeSelf: 6,
      salaryChangeSpouse: 1,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 300,        // 35→335
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 64歳(2061): 車コスト正常化・臨時収入
    {
      ageSelf: 64,
      title: "車コスト正常化",
      note: "車費335→35、臨時収入150",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 0,
      temporaryIncome: 150,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: -300,       // 335→35
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 65歳(2062): 定年退職
    // 給与はretirementAgeSelf=65で自動0
    // NISA停止(-120)
    {
      ageSelf: 65,
      title: "定年退職",
      note: "給与終了・NISA停止",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 0,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: -120,          // 120→0
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 70歳(2067): 40年メンテナンス
    {
      ageSelf: 70,
      title: "40年メンテナンス",
      note: "",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 0,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: 0,
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
    // 79歳(2076): 50年メンテナンス・車手放し
    // 車費35→0(-35)
    {
      ageSelf: 79,
      title: "50年メンテナンス・車手放し",
      note: "車費35→0",
      salaryChangeSelf: 0,
      salaryChangeSpouse: 0,
      temporaryIncome: 0,
      eventExpense: 0,
      nisaChange: 0,
      carCostChange: -35,        // 35→0
      mortgageDeduction: 0,
      childAllowanceChange: 0,
      educationCostChange: 0,
      loanRepaymentChange: 0,
    },
  ];

  for (const ev of events) {
    await prisma.planEvent.create({ data: { planId: plan.id, ...ev } });
  }

  // PDFの「イベント」行（単年支出）を全年分登録
  // 雅也29歳〜85歳の実際のイベント支出
  const eventExpenses: Array<{ ageSelf: number; title: string; amount: number }> = [
    { ageSelf: 29, title: "年間イベント支出", amount: 90 },
    { ageSelf: 30, title: "年間イベント支出", amount: 90 },
    { ageSelf: 31, title: "年間イベント支出", amount: 80 },
    { ageSelf: 32, title: "年間イベント支出", amount: 50 },
    { ageSelf: 33, title: "年間イベント支出", amount: 70 },
    { ageSelf: 34, title: "年間イベント支出", amount: 70 },
    { ageSelf: 35, title: "年間イベント支出", amount: 250 },
    { ageSelf: 36, title: "年間イベント支出", amount: 80 },
    { ageSelf: 37, title: "年間イベント支出", amount: 50 },
    { ageSelf: 38, title: "年間イベント支出", amount: 270 },
    { ageSelf: 39, title: "年間イベント支出", amount: 70 },
    { ageSelf: 40, title: "年間イベント支出", amount: 50 },
    { ageSelf: 41, title: "年間イベント支出", amount: 80 },
    { ageSelf: 42, title: "年間イベント支出", amount: 50 },
    { ageSelf: 43, title: "年間イベント支出", amount: 70 },
    { ageSelf: 44, title: "年間イベント支出", amount: 70 },
    { ageSelf: 45, title: "年間イベント支出", amount: 80 },
    { ageSelf: 46, title: "年間イベント支出", amount: 50 },
    { ageSelf: 47, title: "年間イベント支出", amount: 250 },
    { ageSelf: 48, title: "年間イベント支出", amount: 70 },
    { ageSelf: 49, title: "年間イベント支出", amount: 70 },
    { ageSelf: 50, title: "年間イベント支出", amount: 50 },
    { ageSelf: 51, title: "年間イベント支出", amount: 80 },
    { ageSelf: 52, title: "年間イベント支出", amount: 50 },
    { ageSelf: 53, title: "年間イベント支出", amount: 70 },
    { ageSelf: 54, title: "年間イベント支出", amount: 70 },
    { ageSelf: 55, title: "年間イベント支出", amount: 80 },
    { ageSelf: 56, title: "年間イベント支出", amount: 50 },
    { ageSelf: 57, title: "年間イベント支出", amount: 150 },
    { ageSelf: 58, title: "年間イベント支出", amount: 170 },
    { ageSelf: 59, title: "年間イベント支出", amount: 70 },
    { ageSelf: 60, title: "年間イベント支出", amount: 50 },
    { ageSelf: 61, title: "年間イベント支出", amount: 80 },
    { ageSelf: 62, title: "年間イベント支出", amount: 150 },
    { ageSelf: 63, title: "年間イベント支出", amount: 170 },
    { ageSelf: 64, title: "年間イベント支出", amount: 70 },
    { ageSelf: 65, title: "年間イベント支出", amount: 50 },
    { ageSelf: 66, title: "年間イベント支出", amount: 70 },
    { ageSelf: 67, title: "年間イベント支出", amount: 40 },
    { ageSelf: 68, title: "年間イベント支出", amount: 40 },
    { ageSelf: 69, title: "年間イベント支出", amount: 40 },
    { ageSelf: 70, title: "年間イベント支出", amount: 60 },
    { ageSelf: 71, title: "年間イベント支出", amount: 60 },
    { ageSelf: 72, title: "年間イベント支出", amount: 40 },
    { ageSelf: 73, title: "年間イベント支出", amount: 40 },
    { ageSelf: 74, title: "年間イベント支出", amount: 40 },
    { ageSelf: 75, title: "年間イベント支出", amount: 40 },
    { ageSelf: 76, title: "年間イベント支出", amount: 40 },
    { ageSelf: 77, title: "年間イベント支出", amount: 40 },
    { ageSelf: 78, title: "年間イベント支出", amount: 40 },
    { ageSelf: 79, title: "年間イベント支出", amount: 40 },
    { ageSelf: 80, title: "年間イベント支出", amount: 30 },
    { ageSelf: 81, title: "年間イベント支出", amount: 30 },
    { ageSelf: 82, title: "年間イベント支出", amount: 30 },
    { ageSelf: 83, title: "年間イベント支出", amount: 30 },
    { ageSelf: 84, title: "年間イベント支出", amount: 30 },
    { ageSelf: 85, title: "年間イベント支出", amount: 30 },
  ];

  const zero = {
    salaryChangeSelf: 0, salaryChangeSpouse: 0, temporaryIncome: 0,
    nisaChange: 0, carCostChange: 0, mortgageDeduction: 0,
    childAllowanceChange: 0, educationCostChange: 0, loanRepaymentChange: 0,
  };
  for (const { ageSelf, title, amount } of eventExpenses) {
    await prisma.planEvent.create({
      data: { planId: plan.id, ageSelf, title, eventExpense: amount, ...zero },
    });
  }

  console.log(`プラン「${plan.name}」とイベント${events.length + eventExpenses.length}件を登録しました`);
  await (prisma as unknown as { $disconnect: () => Promise<void> }).$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
