---
layout: layouts/post.njk
title: "KVM Bridge Networking: חיבור מכונות וירטואליות לרשתות פיזיות"
excerpt: "מדריך שלב אחר שלב להגדרת גשר KVM ב-Fedora."
date: 2026-01-10
topic: t5
slug: kvm-bridge-networking
permalink: /he/blog/kvm-bridge-networking/
---

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
          </div>
        </div>

        <div class="related-articles">
          <h3 class="related-articles__title">Похожие статьи</h3>
          <div class="related-articles__grid">
          <a href="blog-11.html" class="blog-card" data-blog-id="11">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-7.html" class="blog-card" data-blog-id="7">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          <a href="blog-9.html" class="blog-card" data-blog-id="9">
            <span class="blog-card__topic"></span>
            <h3 class="blog-card__title"></h3>
            <p class="blog-card__excerpt"></p>
            <span class="blog-card__read-more">Читать далее </span>
          </a>
          </div>
        </div>