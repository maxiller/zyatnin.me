---
layout: layouts/post.njk
title: "Интеграция Telegram-ботов с очередями задач: aiogram + RQ + Valkey"
excerpt: "Полная архитектура асинхронного Telegram-бота с фоновой обработкой задач."
date: 2026-02-28
topic: t2
slug: telegram-bot-rq-valkey
permalink: /ru/blog/telegram-bot-rq-valkey/
---

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