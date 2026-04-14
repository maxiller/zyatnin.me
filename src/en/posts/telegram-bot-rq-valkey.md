---
layout: layouts/post.njk
title: "Integrating Telegram Bots with Task Queues: aiogram + RQ + Valkey"
excerpt: "Complete architecture for async Telegram bot with background job processing."
date: 2026-02-28
topic: t2
slug: telegram-bot-rq-valkey
permalink: /en/blog/telegram-bot-rq-valkey/
---

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