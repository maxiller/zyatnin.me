---
layout: layouts/post.njk
title: "KVM Bridge Networking: Connecting VMs to Physical Networks"
excerpt: "Step-by-step KVM bridge setup on Fedora for connecting VMs to physical networks."
date: 2026-01-10
topic: t5
slug: kvm-bridge-networking
permalink: /en/blog/kvm-bridge-networking/
---

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