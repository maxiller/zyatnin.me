---
slug: telegram-bot-rq-valkey
view: dev
date: 2025-11-14
tags: ["python", "queues", "telegram"]
translations:
  ru:
    title: "Интеграция Telegram-ботов с очередями задач: aiogram + RQ + Valkey"
    excerpt: "Полная архитектура асинхронного Telegram-бота с фоновой обработкой задач."
  en:
    title: "Integrating Telegram Bots with Task Queues: aiogram + RQ + Valkey"
    excerpt: "Complete architecture for async Telegram bot with background job processing."
  he:
    title: "שילוב בוטים של Telegram עם תורי משימות: aiogram + RQ + Valkey"
    excerpt: "ארכיטקטורה מלאה לבוט Telegram אסינכרוני עם עיבוד משימות ברקע."
---

<!-- lang:ru -->

<h2>Введение</h2>
<p>Telegram-боты — мощный инструмент для автоматизации рабочих процессов. Однако обработка тяжёлых задач непосредственно в обработчиках бота блокирует event loop и приводит к задержкам в ответах. Решение — разделение на асинхронный бот (aiogram) и фоновые воркеры (RQ + Valkey).</p>

<h2>Архитектура системы</h2>
<p>Полный цикл обработки запроса выглядит так: пользователь отправляет сообщение → бот получает его через aiogram → бот ставит задачу в очередь RQ через Valkey → RQ-воркер обрабатывает задачу → воркер отправляет результат обратно через Telegram API с привязкой к исходному сообщению.</p>

<h2>Бот: приём и постановка в очередь</h2>

<pre><code><span class="kw">from</span> aiogram <span class="kw">import</span> Bot, Dispatcher, types
<span class="kw">from</span> redis <span class="kw">import</span> Redis
<span class="kw">from</span> rq <span class="kw">import</span> Queue

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
redis_conn = Redis(host=<span class="str">'localhost'</span>, port=<span class="num">6379</span>)
task_queue = Queue(<span class="str">'telegram'</span>, connection=redis_conn)

@dp.message()
<span class="kw">async def</span> <span class="fn">handle_message</span>(message: types.Message):
    <span class="cm"># Ставим задачу в очередь, не блокируя бот</span>
    task_queue.enqueue(
        <span class="str">'workers.send_text_task'</span>,
        chat_id=message.chat.id,
        text=message.text,
        reply_to=message.message_id
    )
<span class="kw">await</span> message.reply(<span class="str">"⏳ Обрабатываю запрос..."</span>)</code></pre>

<h2>Воркер: обработка и ответ</h2>

<pre><code><span class="cm"># workers.py</span>
<span class="kw">import</span> asyncio
<span class="kw">from</span> aiogram <span class="kw">import</span> Bot

<span class="kw">def</span> <span class="fn">send_text_task</span>(chat_id, text, reply_to):
    <span class="cm"># Обрабатываем задачу (может быть долгой операцией)</span>
    result = process_heavy_task(text)

    <span class="cm"># Отправляем результат через бот</span>
    _run_async_task(
        _reply_message(chat_id, result, reply_to)
    )

<span class="kw">async def</span> <span class="fn">_reply_message</span>(chat_id, text, reply_to):
    bot = Bot(token=BOT_TOKEN)
    <span class="kw">await</span> bot.send_message(
        chat_id=chat_id,
        text=text,
        reply_to_message_id=reply_to
    )
    <span class="kw">await</span> bot.session.close()

<span class="kw">def</span> <span class="fn">_run_async_task</span>(coro):
    loop = asyncio.new_event_loop()
    <span class="kw">try</span>:
        loop.run_until_complete(coro)
    <span class="kw">finally</span>:
loop.close()</code></pre>

<h2>ValkeyPersistence для хранения состояния</h2>
<p>Для отслеживания статуса задач мы используем Valkey (совместимый с Redis). FinishedJobRegistry позволяет боту периодически проверять завершённые задачи и уведомлять пользователей о результатах.</p>

<h2>reply_to_message_id для тредов</h2>
<p>Важная деталь — сохранение message_id исходного сообщения и передача его в reply_to_message_id при ответе. Это создаёт естественный тред в чате и помогает пользователю связать ответ с запросом, особенно когда несколько запросов обрабатываются параллельно.</p>

<h2>Контейнеризация</h2>
<p>Бот и воркеры работают в отдельных контейнерах внутри одного Podman-пода. Valkey также запущен в поде, обеспечивая коммуникацию через localhost.</p>

<h2>Заключение</h2>
<p>Разделение Telegram-бота на фронтенд (aiogram) и бэкенд (RQ-воркеры) обеспечивает отзывчивость бота и масштабируемость обработки. Valkey служит как брокером сообщений, так и хранилищем состояния.</p>

<!-- lang:en -->

<h2>Introduction</h2>
<p>Telegram bots are a powerful tool for workflow automation. However, processing heavy tasks directly in bot handlers blocks the event loop and leads to response delays. The solution is to separate the async bot (aiogram) from background workers (RQ + Valkey).</p>

<h2>System Architecture</h2>
<p>The complete request processing cycle works as follows: user sends a message → bot receives it via aiogram → bot enqueues a task in RQ via Valkey → RQ worker processes the task → worker sends the result back via Telegram API, linked to the original message.</p>

<h2>Bot: Receiving and Enqueueing</h2>

<pre><code><span class="kw">from</span> aiogram <span class="kw">import</span> Bot, Dispatcher, types
<span class="kw">from</span> rq <span class="kw">import</span> Queue

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
task_queue = Queue(<span class="str">'telegram'</span>, connection=redis_conn)

@dp.message()
<span class="kw">async def</span> <span class="fn">handle_message</span>(message: types.Message):
    task_queue.enqueue(
        <span class="str">'workers.send_text_task'</span>,
        chat_id=message.chat.id,
        text=message.text,
        reply_to=message.message_id
    )
<span class="kw">await</span> message.reply(<span class="str">"⏳ Processing request..."</span>)</code></pre>

<h2>Worker: Processing and Responding</h2>

<pre><code><span class="kw">def</span> <span class="fn">send_text_task</span>(chat_id, text, reply_to):
    result = process_heavy_task(text)
    _run_async_task(
        _reply_message(chat_id, result, reply_to)
    )

<span class="kw">async def</span> <span class="fn">_reply_message</span>(chat_id, text, reply_to):
    bot = Bot(token=BOT_TOKEN)
    <span class="kw">await</span> bot.send_message(
        chat_id=chat_id, text=text,
        reply_to_message_id=reply_to
    )
<span class="kw">await</span> bot.session.close()</code></pre>

<h2>ValkeyPersistence for State Storage</h2>
<p>To track task statuses, we use Valkey (Redis-compatible). FinishedJobRegistry allows the bot to periodically check completed tasks and notify users of results. The worker stores results with TTL to prevent memory bloat.</p>

<h2>reply_to_message_id for Threading</h2>
<p>An important detail is preserving the original message_id and passing it to reply_to_message_id when responding. This creates a natural thread in the chat and helps the user link the response to their request, especially when multiple requests are being processed in parallel.</p>

<h2>Containerization</h2>
<p>The bot and workers run in separate containers within a single Podman pod. Valkey also runs in the pod, providing communication via localhost. This simplifies deployment and ensures all components share the same network.</p>

<h2>Conclusion</h2>
<p>Separating a Telegram bot into a frontend (aiogram) and backend (RQ workers) ensures bot responsiveness and processing scalability. Valkey serves as both message broker and state store.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>בוטים של Telegram הם כלי רב-עוצמה לאוטומציה של תהליכי עבודה. עם זאת, עיבוד משימות כבדות ישירות במטפלי הבוט חוסם את לולאת האירועים ומוביל לעיכובים בתגובות. הפתרון הוא להפריד את הבוט האסינכרוני (aiogram) מעובדי הרקע (RQ + Valkey).</p>

<h2>ארכיטקטורת המערכת</h2>
<p>מחזור עיבוד הבקשה המלא עובד כך: משתמש שולח הודעה → הבוט מקבל אותה דרך aiogram → הבוט שם משימה בתור RQ דרך Valkey → עובד RQ מעבד את המשימה → העובד שולח את התוצאה בחזרה דרך Telegram API, מקושר להודעה המקורית.</p>

<h2>הבוט: קבלה והכנסה לתור</h2>
<p>הבוט מקבל הודעות דרך aiogram ומכניס משימות לתור RQ. התגובה המיידית מאשרת את קבלת הבקשה, והעיבוד בפועל מתבצע ברקע על ידי העובד.</p>

<h2>העובד: עיבוד ותגובה</h2>
<p>העובד מעבד את המשימה ושולח את התוצאה בחזרה דרך Telegram API. פונקציית העזר <code>_run_async_task</code> מאפשרת להריץ קוד אסינכרוני מתוך עובד RQ סינכרוני.</p>

<h2>ValkeyPersistence לאחסון מצב</h2>
<p>למעקב אחר סטטוס משימות, אנחנו משתמשים ב-Valkey (תואם Redis). FinishedJobRegistry מאפשר לבוט לבדוק מעת לעת משימות שהושלמו ולהודיע למשתמשים על תוצאות.</p>

<h2>reply_to_message_id לשרשורים</h2>
<p>פרט חשוב הוא שמירת ה-message_id המקורי והעברתו ל-reply_to_message_id בעת התגובה. זה יוצר שרשור טבעי בצ'אט ועוזר למשתמש לקשר את התגובה לבקשה שלו.</p>

<h2>קונטיינריזציה</h2>
<p>הבוט והעובדים רצים בקונטיינרים נפרדים בתוך פוד Podman יחיד. Valkey גם רץ בפוד, מספק תקשורת דרך localhost.</p>

<h2>סיכום</h2>
<p>הפרדת בוט Telegram לפרונטאנד (aiogram) ובקאנד (עובדי RQ) מבטיחה תגובתיות של הבוט וסקלביליות עיבוד. Valkey משמש גם כמתווך הודעות וגם כמאגר מצב.</p>
