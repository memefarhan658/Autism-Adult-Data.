# إزاي تعرضي Spectrum Atlas في مقابلة؟

**الفكرة في جملة:** حوّلتِ ملف استبيانات بحثية إلى واجهة يقدر الزائر يتتبع فيها أي رقم من الرسم البياني لحد السجلات اللي اتحسب منها، مع توضيح حدود البيانات.

## مسار عرض في دقيقة

1. **أول 15 ثانية — Overview:** افتحي الديمو على صفحة الملخص. اشرحي إن البيانات منشورة على UCI، وفيها 704 سجلات من 67 دولة وإقليم. الأسئلة العشرة بتنتج درجة من صفر لعشرة.
2. **15 ثانية — من الرسم للسجلات:** اضغطي على العمود **4** في Score distribution. دي أكتر درجة تكررت: 131 سجل. المستكشف بيفتح على نفس المجموعة، مش على الداتا كلها. افتحي سجل واحد عشان توري إزاي إجابات البنود العشرة بتكوّن الدرجة.
3. **15 ثانية — التحليل قابل للمراجعة:** من Score analysis اختاري **Unknown** تحت Focus by age. الرسوم بتتحسب على 3 سجلات فقط؛ قيمتين للعمر كانوا ناقصين وقيمة كانت 383. السجلات ما اتحذفتش، وباقي إجاباتها لسه صالحة للتحليل. جرّبي Export summary عشان تنزلي النتيجة بنفس نطاق التحليل.
4. **آخر 15 ثانية — أهم قرار تقني:** افتحي Methodology. في الملف ده، الـYES مطابق تمامًا للدرجات من 7 لـ10. بالتالي لو درّبنا موديل على الدرجات عشان يتوقع العمود ده، هيعيد إنتاج القاعدة الموجودة، مش هيقدم دليل إنه بيشخّص التوحد. ده سبب اختيار التحليل الوصفي بدل الادعاء بدقة تشخيصية.

## تقديم مختصر بالإنجليزي

> I built Spectrum Atlas to make a public screening dataset easy to inspect. Every bar links to the records behind it, and the exported results reflect the selected cohort. The key finding was a limitation: the published screening label follows the score exactly in these data. Rather than report misleading model accuracy, I documented that relationship and built a reproducible descriptive analysis.

## جملة مناسبة للـCV

> Built a reproducible research dashboard for 704 UCI screening records using React, TypeScript, and a validated Python data pipeline; implemented cohort drill-down, accessible charts, and filtered CSV exports.

استخدمي الصياغة اللي تقدري تشرحي تفاصيلها بنفسك. لو اتسألتي عن التحقق، افتحي `tests/` وورّي مثال اختبار جمع الدرجات أو اختبار تصدير السجلات المفلترة.

## قبل ما تبعتي المشروع

- راجعي [صفحة مصدر البيانات](../data/README.md) وحقوق استخدامها.
- استخدمي الـLive Preview لتجربة المشروع دلوقتي. للـCV استخدمي **لينك النشر العام** بعد تنفيذ [خطوات النشر](deployment.md)، مش `localhost` أو لينك جلسة مؤقتة.
- جرّبي اللينك المنشور من نافذة خاصة على الموبايل: افتحي الرسم، فلترة، ثم تصدير.
- اعرضيه كـ**مشروع تحليل بيانات** يعكس مهاراتك، مش أداة طبية أو أداة لتقييم المتقدمين للوظائف.
