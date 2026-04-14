---
layout: layouts/post.njk
title: "KVM Bridge Networking: подключение виртуальных машин к физической сети"
excerpt: "Пошаговая настройка сетевого моста KVM на Fedora."
date: 2026-01-10
topic: t5
slug: kvm-bridge-networking
permalink: /ru/blog/kvm-bridge-networking/
---

<h2>Введение</h2>
            <p>Подключение виртуальных машин KVM к физической сети через мост — типовая задача для лаборатории или тестового стенда. Однако настройка bridge в Linux имеет подводные камни. В этой статье — пошаговое руководство с разбором типичных ошибок.</p>

            <h2>Типичная ошибка: enp0s31f6 как bridge</h2>
            <p>Распространённая ошибка — попытка назначить IP-адрес непосредственно на физический интерфейс (например, enp0s31f6), который добавляется в мост. При создании bridge IP-адрес должен быть на интерфейсе br0, а не на физическом интерфейсе.</p>

            <h2>Создание моста с nmcli</h2>
            <pre><code><span class="cm"># Создаём bridge-интерфейс</span>
nmcli connection add type bridge ifname br0 con-name br0

<span class="cm"># Настраиваем IP (статический или DHCP)</span>
nmcli connection modify br0 ipv4.addresses <span class="str">"192.168.1.100/24"</span>
nmcli connection modify br0 ipv4.gateway <span class="str">"192.168.1.1"</span>
nmcli connection modify br0 ipv4.dns <span class="str">"192.168.1.1"</span>
nmcli connection modify br0 ipv4.method manual

<span class="cm"># Добавляем физический интерфейс как slave</span>
nmcli connection add type bridge-slave \
  ifname enp0s31f6 master br0

<span class="cm"># Поднимаем bridge</span>
nmcli connection up br0</code></pre>

            <h2>Добавление физического интерфейса как slave</h2>
            <p>Физический интерфейс (enp0s31f6) добавляется как bridge-slave. При этом его собственное сетевое соединение деактивируется — весь трафик идёт через br0. Важно делать это через консоль или IPMI, так как SSH-соединение прервётся.</p>

            <h2>Настройка VM NIC</h2>
            <p>В конфигурации виртуальной машины (virsh edit или virt-manager) сетевой интерфейс привязывается к br0:</p>
            <pre><code><span class="cm">&lt;!-- Фрагмент XML-конфигурации VM --&gt;</span>
&lt;interface type=<span class="str">'bridge'</span>&gt;
  &lt;source bridge=<span class="str">'br0'</span>/&gt;
  &lt;model type=<span class="str">'virtio'</span>/&gt;
&lt;/interface&gt;</code></pre>

            <h2>Проверка с bridge link и tcpdump</h2>
            <pre><code><span class="cm"># Проверяем участников моста</span>
bridge link show

<span class="cm"># Проверяем трафик на bridge</span>
tcpdump -i br0 -n

<span class="cm"># Проверяем ARP-таблицу</span>
ip neigh show dev br0

<span class="cm"># Проверяем маршрутизацию</span>
ip route show</code></pre>

            <h2>Устранение проблем с подключением</h2>
            <p>Если VM не получает IP через DHCP: проверьте STP (spanning tree protocol) — для одного моста его можно отключить через <code>nmcli connection modify br0 bridge.stp no</code>. Убедитесь, что firewalld не блокирует bridge-трафик. Проверьте, что net.bridge.bridge-nf-call-iptables установлен в 0.</p>
            <pre><code><span class="cm"># Отключаем фильтрацию bridge-трафика через iptables</span>
sysctl net.bridge.bridge-nf-call-iptables=<span class="num">0</span>
sysctl net.bridge.bridge-nf-call-ip6tables=<span class="num">0</span>

<span class="cm"># Или отключаем STP для простого моста</span>
nmcli connection modify br0 bridge.stp no
nmcli connection up br0</code></pre>

            <h2>Полезные советы</h2>
            <ul>
              <li>Всегда настраивайте bridge через консоль, не через SSH</li>
              <li>Используйте virtio для NIC виртуальных машин — это значительно увеличивает пропускную способность</li>
              <li>Для нескольких VLAN используйте VLAN sub-interfaces на bridge</li>
              <li>Документируйте конфигурацию — сетевые настройки легко потерять при обновлении системы</li>
            </ul>

            <h2>Заключение</h2>
            <p>Настройка KVM bridge networking через nmcli — несложная процедура при понимании принципов работы. Ключевые моменты: IP-адрес на br0, физический интерфейс как slave, отключение STP для простых конфигураций и проверка firewall-правил.</p>