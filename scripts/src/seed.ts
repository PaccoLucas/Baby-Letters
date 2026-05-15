import { db, testimonialsTable, portfolioTable } from "@workspace/db";
import { count } from "drizzle-orm";

const defaultTestimonials = [
  { name: "Rafaela M.", avatar: "RM", text: "Fiz meu lettering com a Brhenda e ficou INCRÍVEL. Ela entendeu exatamente o que eu queria. Super atenciosa e caprichosa!", stars: 5, visible: true, pending: false },
  { name: "Lucas S.", avatar: "LS", text: "Trabalho impecável. Minha tatuagem ficou melhor do que eu imaginava. Com certeza voltarei para fazer mais peças!", stars: 5, visible: true, pending: false },
  { name: "Camila R.", avatar: "CR", text: "A Brhenda é extremamente talentosa. O traço é perfeito, o atendimento é ótimo. Indico de olhos fechados!", stars: 5, visible: true, pending: false },
  { name: "Thiago P.", avatar: "TP", text: "Fiz uma frase no braço e o resultado foi surreal. Arte urbana de verdade. Valeu cada centavo!", stars: 5, visible: true, pending: false },
];

const defaultPortfolio = [
  { url: "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=500&auto=format&fit=crop", alt: "Lettering delicado no pulso", orderIndex: 0, visible: true },
  { url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=500&auto=format&fit=crop", alt: "Lettering em caixa alta no braço", orderIndex: 1, visible: true },
  { url: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=500&auto=format&fit=crop", alt: "Lettering cursiva nas costelas", orderIndex: 2, visible: true },
  { url: "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?q=80&w=500&auto=format&fit=crop", alt: "Lettering ornamental na perna", orderIndex: 3, visible: true },
];

async function seed() {
  const [{ value: tCount }] = await db.select({ value: count() }).from(testimonialsTable);
  if (Number(tCount) === 0) {
    await db.insert(testimonialsTable).values(defaultTestimonials);
    console.log(`✓ Seeded ${defaultTestimonials.length} testimonials`);
  } else {
    console.log(`— Testimonials already seeded (${tCount} rows)`);
  }

  const [{ value: pCount }] = await db.select({ value: count() }).from(portfolioTable);
  if (Number(pCount) === 0) {
    await db.insert(portfolioTable).values(defaultPortfolio);
    console.log(`✓ Seeded ${defaultPortfolio.length} portfolio items`);
  } else {
    console.log(`— Portfolio already seeded (${pCount} rows)`);
  }

  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
