import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other secure payment methods through our payment processor."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial on all plans. No credit card required to start."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely! You can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-display font-bold text-center mb-4 animate-slide-up">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-center mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Got questions? We've got answers.
        </p>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border/50 rounded-lg px-6 backdrop-blur-sm bg-card/30 animate-slide-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <AccordionTrigger className="text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
