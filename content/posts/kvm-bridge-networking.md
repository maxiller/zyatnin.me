---
slug: kvm-bridge-networking
view: dev
date: 2025-07-01
tags: ["networking", "virtualization", "linux"]
translations:
  ru:
    title: "KVM Bridge Networking: подключение виртуальных машин к физической сети"
    excerpt: "Пошаговая настройка сетевого моста KVM на Fedora."
  en:
    title: "KVM Bridge Networking: Connecting VMs to Physical Networks"
    excerpt: "Step-by-step KVM bridge setup on Fedora for connecting VMs to physical networks."
  he:
    title: "KVM Bridge Networking: חיבור מכונות וירטואליות לרשתות פיזיות"
    excerpt: "מדריך שלב אחר שלב להגדרת גשר KVM ב-Fedora."
---

<!-- lang:ru -->

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

<!-- lang:en -->

<h2>Introduction</h2>
<p>Connecting KVM virtual machines to physical networks via bridges is a standard task for labs and test environments. However, bridge configuration in Linux has pitfalls. This article provides a step-by-step guide with analysis of common errors.</p>

<h2>Common Error: enp0s31f6 as Bridge</h2>
<p>A common mistake is assigning an IP address directly to the physical interface (e.g., enp0s31f6) that's added to a bridge. When creating a bridge, the IP must be on br0, not on the physical interface.</p>

<h2>Creating a Bridge with nmcli</h2>

<pre><code><span class="cm"># Create bridge interface</span>
nmcli connection add type bridge ifname br0 con-name br0

<span class="cm"># Configure IP</span>
nmcli connection modify br0 ipv4.addresses <span class="str">"192.168.1.100/24"</span>
nmcli connection modify br0 ipv4.gateway <span class="str">"192.168.1.1"</span>
nmcli connection modify br0 ipv4.method manual

<span class="cm"># Add physical interface as slave</span>
nmcli connection add type bridge-slave \
  ifname enp0s31f6 master br0

<span class="cm"># Bring up the bridge</span>
nmcli connection up br0</code></pre>

<h2>Adding Physical Interface as Slave</h2>
<p>The physical interface (enp0s31f6) is added as a bridge-slave. Its own network connection is deactivated — all traffic goes through br0. Important: do this via console or IPMI, as the SSH connection will drop.</p>

<h2>Configuring VM NIC</h2>
<p>In the VM configuration (virsh edit or virt-manager), the network interface binds to br0. Use virtio for the NIC model — it significantly increases throughput compared to e1000.</p>

<h2>Verification with bridge link and tcpdump</h2>

<pre><code><span class="cm"># Check bridge members</span>
bridge link show

<span class="cm"># Monitor bridge traffic</span>
tcpdump -i br0 -n

<span class="cm"># Check ARP table</span>
ip neigh show dev br0</code></pre>

<h2>Troubleshooting Connectivity</h2>
<p>If the VM doesn't get a DHCP IP: check STP — for a single bridge, disable it via nmcli. Ensure firewalld isn't blocking bridge traffic. Verify net.bridge.bridge-nf-call-iptables is set to 0.</p>

<h2>Useful Tips</h2>
<ul>
<li>Always configure bridges via console, not SSH</li>
<li>Use virtio for VM NICs — significant throughput improvement</li>
<li>For multiple VLANs, use VLAN sub-interfaces on the bridge</li>
<li>Document your configuration — network settings are easily lost on system updates</li>
</ul>

<h2>Conclusion</h2>
<p>KVM bridge networking setup via nmcli is straightforward once you understand the principles. Key points: IP address on br0, physical interface as slave, STP disabled for simple configurations, and firewall rule verification.</p>

<!-- lang:he -->

<h2>מבוא</h2>
<p>חיבור מכונות וירטואליות KVM לרשתות פיזיות דרך גשרים הוא משימה סטנדרטית למעבדות וסביבות בדיקה. עם זאת, להגדרת bridge ב-Linux יש מלכודות. מאמר זה מספק מדריך שלב אחר שלב עם ניתוח שגיאות נפוצות.</p>

<h2>שגיאה נפוצה: enp0s31f6 כגשר</h2>
<p>שגיאה נפוצה היא הקצאת כתובת IP ישירות לממשק הפיזי (למשל, enp0s31f6) שמתווסף לגשר. כשיוצרים גשר, ה-IP חייב להיות על br0, לא על הממשק הפיזי.</p>

<h2>יצירת גשר עם nmcli</h2>

<pre><code><span class="cm"># יצירת ממשק גשר</span>
nmcli connection add type bridge ifname br0

<span class="cm"># הגדרת IP</span>
nmcli connection modify br0 ipv4.addresses <span class="str">"192.168.1.100/24"</span>
nmcli connection modify br0 ipv4.gateway <span class="str">"192.168.1.1"</span>
nmcli connection modify br0 ipv4.method manual

<span class="cm"># הוספת ממשק פיזי כ-slave</span>
nmcli connection add type bridge-slave \
  ifname enp0s31f6 master br0

<span class="cm"># הפעלת הגשר</span>
nmcli connection up br0</code></pre>

<h2>הוספת ממשק פיזי כ-Slave</h2>
<p>הממשק הפיזי (enp0s31f6) מתווסף כ-bridge-slave. חיבור הרשת שלו מושבת — כל התעבורה עוברת דרך br0. חשוב: עשו זאת דרך קונסולה או IPMI, כי חיבור SSH יינתק.</p>

<h2>הגדרת NIC של VM</h2>
<p>בתצורת ה-VM (virsh edit או virt-manager), ממשק הרשת מקושר ל-br0. השתמשו ב-virtio לדגם ה-NIC — זה משפר משמעותית את התפוקה.</p>

<h2>אימות עם bridge link ו-tcpdump</h2>
<p>השתמשו ב-bridge link show כדי לבדוק חברי גשר, tcpdump -i br0 לניטור תעבורה, ו-ip neigh show dev br0 לטבלת ARP.</p>

<h2>פתרון בעיות קישוריות</h2>
<p>אם ה-VM לא מקבל IP מ-DHCP: בדקו STP — עבור גשר בודד, השביתו אותו דרך nmcli. ודאו ש-firewalld לא חוסם תעבורת bridge. אמתו ש-net.bridge.bridge-nf-call-iptables מוגדר ל-0.</p>

<h2>טיפים שימושיים</h2>
<ul>
<li>תמיד הגדירו גשרים דרך קונסולה, לא SSH</li>
<li>השתמשו ב-virtio ל-NIC של VM — שיפור תפוקה משמעותי</li>
<li>למספר VLANs, השתמשו ב-VLAN sub-interfaces על הגשר</li>
<li>תעדו את התצורה — הגדרות רשת קל לאבד בעדכוני מערכת</li>
</ul>

<h2>סיכום</h2>
<p>הגדרת KVM bridge networking דרך nmcli היא ישירה ברגע שמבינים את העקרונות. נקודות מפתח: כתובת IP על br0, ממשק פיזי כ-slave, STP מושבת לתצורות פשוטות, ואימות כללי firewall.</p>
