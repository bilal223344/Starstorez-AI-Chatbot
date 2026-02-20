## **name: enterprise-ecommerce-chatbot-qa description: Comprehensive QA and testing guidelines for evaluating enterprise-level e-commerce chatbots. This skill should be used when building, testing, reviewing conversational AI flows, or executing cognitive stress tests to ensure accuracy, resilience, and proper handling of edge cases. license: MIT metadata: author: qa-engineering version: "1.0.0"**

# **Enterprise E-Commerce Chatbot QA Skill**

Comprehensive quality assurance (QA) optimization guide and checklist for evaluating the performance, accuracy, and resilience of conversational AI agents in e-commerce. Contains rules across 5 major categories, prioritized by impact to guide automated testing and conversational design.

## **When to Apply**

Reference these guidelines when:

* Designing or writing new conversational AI flows  
* Executing quality assurance (QA) on e-commerce chatbots  
* Reviewing fallback, misunderstanding, and escalation strategies  
* Stress-testing LLMs for context memory, hallucinations, and prompt injections  
* Implementing and validating business logic boundaries

## **Rule Categories by Priority**

| Priority | Category | Impact | Prefix |
| :---- | :---- | :---- | :---- |
| 1 | Security & Resilience | CRITICAL | sec- |
| 2 | Core E-commerce Flows | CRITICAL | core- |
| 3 | Cognitive & Contextual | HIGH | cog- |
| 4 | Post-Purchase Operations | HIGH | post- |
| 5 | Conversational UX | MEDIUM-HIGH | ux- |

## **Quick Reference**

### **1\. Security & Resilience (CRITICAL)**

* sec-injection \- Test against prompt injection ("Ignore previous instructions...") and standard vulnerabilities (XSS, SQL).  
* sec-boundary \- Enforce business logic limits (e.g., negative quantities, out-of-stock orders, expired coupons, 10k+ quantities).  
* sec-abuse \- Validate graceful handling of emoji spam, ALL CAPS, profanity, and excessively long inputs.  
* sec-rate-limit \- Simulate API timeouts and rapid repeated requests to test system stability.

### **2\. Core E-commerce Flows (CRITICAL)**

* core-discovery \- Test basic queries, ambiguous inferences, typographical errors (fuzzy matching), and filtering limits.  
* core-product \- Verify precise responses regarding stock, sizing, materials, compatibility, and competitor comparisons.  
* core-pricing \- Ensure accurate rendering of base prices, applied discounts, bundle offers, and price matching rules.  
* core-checkout \- Validate cart manipulation (add, remove, update quantity) and verify payment/checkout edge cases.  
* core-auth \- Test account creation, password resets, OTP failures, and guest checkout allowances.

### **3\. Cognitive & Contextual (HIGH)**

* cog-memory \- Verify the bot accurately tracks the item in focus across sequences of 5+ conversational turns (add, alter, remove, compare).  
* cog-multi-intent \- Test complex compound parsing (e.g., "Do you have this in stock, why is it out of stock, and when exactly will it restock?").  
* cog-hallucination \- Actively prompt for non-existent products (e.g., "Apple Microwave") to ensure the model firmly denies existence rather than hallucinating.

### **4\. Post-Purchase Operations (HIGH)**

* post-shipping \- Test inquiries on delivery timelines, international shipping, address modifications, and tracking failures.  
* post-returns \- Verify refund policies, handling of damaged/wrong items, and expired return window edge cases.

### **5\. Conversational UX (MEDIUM-HIGH)**

* ux-escalation \- Ensure the bot gracefully escalates to human agents upon detecting high frustration, bad reviews, or explicit requests.  
* ux-fallback \- Verify the bot asks clarifying questions for vague prompts, handles "I don't know", and recovers smoothly from misunderstandings.  
* ux-personalization \- Test AI recommendation logic against stated preferences, budgets, and historical views.  
* ux-multilingual \- Test robustness against code-switching, broken grammar, and regional languages (e.g., Roman Urdu/Hindi).