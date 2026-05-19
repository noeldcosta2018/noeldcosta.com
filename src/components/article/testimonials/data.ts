/**
 * Structured testimonial data for the About / story page. Each
 * testimonial is its own typed object so the card component renders
 * name, title, avatar, and quote in separate elements — instead of
 * collapsing into a single run of text the way the WordPress import did.
 *
 * Order matches the original WordPress page:
 *   Tareq, Adam, Andrew Stotter Brooks, Andrew MacFarlane, Ruchira,
 *   Farouq, Mike, Anubhav, Takhliq.
 *
 * Avatar files are the WordPress-imported assets in
 * /public/images/wp/2025/02/. Quote text is preserved verbatim from
 * the original LinkedIn recommendations so attribution stays accurate.
 */

export interface Testimonial {
  name: string;
  title: string;
  avatarUrl: string;
  quote: string[];
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Tareq Ashmawy",
    title: "Digital Advisor, Department of Government Enablement",
    avatarUrl: "/images/wp/2025/02/8.webp",
    quote: [
      "Noel is — no cliché — a go-getter with an unprecedented focus on cost optimisation and over-delivering objectives; a mix of qualities that would appear hard for partners or vendors to cope with.",
      "However, I can confirm that my experience with Noel has been challenging, exciting and rewarding.",
    ],
  },
  {
    name: "Adam Boukadida",
    title: "Chief Financial Officer, Riyadh Air",
    avatarUrl: "/images/wp/2025/02/5.webp",
    quote: [
      "We had an opportunity to transform the Finance function in Etihad by automating our processes and providing more transparency in financial reporting.",
      "Noel did a splendid job in helping us define and implement our road-map, which included SAP, our ERP, as well as other reporting solutions using Microsoft and automation tools like Robotics and Process Automation.",
    ],
  },
  {
    name: "Andrew Stotter Brooks",
    title: "Chief Learning Officer, ADNOC Group",
    avatarUrl: "/images/wp/2025/02/9.webp",
    quote: [
      "His ability to inspire those around him, whether through his strategic insights or his personal integrity, has earned him the respect and admiration of many.",
      "He's not only a role model in the professional space but also someone who leads with empathy, always willing to lend an ear or offer guidance when needed.",
    ],
  },
  {
    name: "Andrew MacFarlane",
    title:
      "Managing Partner, Cumbrae Partners LLP (former Chief Investment Officer, Etihad Airways)",
    avatarUrl: "/images/wp/2025/02/6.webp",
    quote: [
      "Noel led the technical delivery of the SAP Finance Transformation project at Etihad.",
      "This was a very substantial undertaking and it is huge credit to Noel that the programme has delivered on time (18 months), on budget and with no major issues.",
    ],
  },
  {
    name: "Ruchira Dasanayake",
    title: "Program Manager, Fortude, United Kingdom",
    avatarUrl: "/images/wp/2025/02/1-2.webp",
    quote: [
      "His deep understanding of SAP solutions, coupled with his strategic vision, has been truly impressive.",
      "Noel's ability to communicate clearly and deliver results that not only meet but exceed expectations has made a lasting impact. He is a true leader who believes in pushing boundaries.",
    ],
  },
  {
    name: "Farouq Al Kabarity",
    title: "Digital Design Manager, Digital DEWA, Dubai",
    avatarUrl: "/images/wp/2025/02/7.webp",
    quote: [
      "Noel's guidance drove significant advancements in our digital initiatives, especially in SAP, improving efficiency and ensuring we stayed ahead of industry trends.",
      "His inclusive leadership fostered a collaborative environment where employees thrived and felt empowered to contribute their best.",
    ],
  },
  {
    name: "Mike Papamichael",
    title:
      "PRISM Consulting Services, Cyprus (former Chief Information Officer, EAG)",
    avatarUrl: "/images/wp/2025/02/3-2.webp",
    quote: [
      "Noel has been a core member of my IT leadership team in Etihad since 2017.",
      "His functional expertise, combined with his financial accounting knowledge and detailed business process understanding and attention to detail gained from working in Internal Audit are invaluable tools that Noel uses to drive business change and deliver amazing results.",
    ],
  },
  {
    name: "Anubhav Agarwal",
    title: "HR Executive Leader, Translink Canada",
    avatarUrl: "/images/wp/2025/02/4-1.webp",
    quote: [
      "Laying the foundation stones for several key IT efforts to support business transformation across the corporate functions, he has helped steer very successful efforts and investments at EY.",
      "His attention to detail and ex-audit background is an unusual, yet refreshingly formidable combination. With his razor-sharp commercial acumen, he is a great partner to work with all round.",
    ],
  },
  {
    name: "Takhliq Hanif",
    title: "Head of Architecture, Volkswagen Financial Services",
    avatarUrl: "/images/wp/2025/02/2-2.webp",
    quote: [
      "Noel has excellent stakeholder management skills and is a very strong communicator. He has a growth mindset and continually challenges himself and his organisation to deliver quicker and more cost-effectively.",
      "Noel is a very talented negotiator and has a laser focus on cost and value. He builds strong business-focused technology organisations and develops them into talented teams.",
    ],
  },
];
