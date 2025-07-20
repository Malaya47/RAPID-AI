'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How does VideoGen create videos from text?",
      answer: "VideoGen uses advanced AI algorithms to analyze your text prompt and generate relevant visuals, animations, and narration. Our system understands context, tone, and style preferences to create cohesive, professional videos that match your requirements."
    },
    {
      question: "Can I edit the generated video?",
      answer: "Yes! After generation, you have full control to edit every aspect of your video. You can modify the narration, adjust timing, change visuals, add effects, and fine-tune the content until it perfectly matches your vision."
    },
    {
      question: "What video formats are supported?",
      answer: "We support all major video formats including MP4, MOV, and WebM. Videos can be exported in various resolutions up to 4K, and we optimize for different platforms like YouTube, Instagram, or professional presentations."
    },
    {
      question: "How long does it take to generate a video?",
      answer: "Most videos are generated within 5-10 minutes, depending on length and complexity. Once generated, you can immediately start editing and customizing your video."
    },
    {
      question: "Can I use custom branding in my videos?",
      answer: "Absolutely! Professional and Enterprise plans include the ability to add your logo, custom colors, fonts, and other branding elements to maintain consistency with your brand identity."
    },
    {
      question: "Is there a limit to video length?",
      answer: "Video length limits depend on your plan. Starter allows up to 3 minutes, Professional up to 10 minutes, and Enterprise has no length restrictions."
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Everything you need to know about VideoGen and our video generation process
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-neutral-900 rounded-lg px-6 border border-neutral-800"
              >
                <AccordionTrigger className="text-white hover:text-indigo-400 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;