+++
title = "Secure Remote Development with VS Code"
date = 2019-12-11
weight = 1
order = 1
insert_anchor_links = "right"
[taxonomies]
categories = ["Cloudflare", "Development"]
tags = ["cloudflare", "development"]
+++

Microsoft recently released an exciting [set of capabilities](https://code.visualstudio.com/docs/remote/ssh) that allows a locally running instance of VS Code to attach to a remote VM or container that serves as the development environment. This allows the benefit of authoring code in a locally running instance of VS Code while moving the compute to a remote host providing the power and unique configuration settings for the development environment. However, the quick start instructions were a bit loose on security, notably leaving port 22 exposed publicly for SSH. This gave me the chance to try out [Cloudflare Access](https://teams.cloudflare.com/access/) and [Argo Tunnel](https://www.cloudflare.com/products/argo-tunnel/) for zero-trust security with SSH.

<!-- more -->

Earlier this year I ran into a [post by Fatih Arslan](https://arslan.io/2019/01/07/using-the-ipad-pro-as-my-development-machine/), the original author of [vim-go](https://github.com/fatih/vim-go), about his experiment using an iPad Pro for development by leveraging remote virtual machines and containers hosted on DigitalOcean.

His post inspired me to experiment with this type of setup using my Google Pixelbook and ran a similar setup to what he described for half of 2019. However, there were a few downsides inherent in the architecture, a large one being that you are working in a code editor running on the host instead of your local machine, inevitibly leading to the feeling of lag while typing.

## VS Code Remote SSH Extension

Remote VS Code extension allows the benefit of authoring code in a locally running instance of VS Code while moving the compute to a remote host providing the power and unique configuration settings for the development environment. Using VM's for development also allows experimentation with new configurations or libraries without fear of breaking your local setup or introducing security vulnerabilities. This can also be helpful those who enjoy hacking on a Raspberry Pi, providing a nice way of using your main computer with VS Code to develop your scripts on the Raspberry Pi without the need for finding a separate display or using VNC.

[{{ img(src="./blog/remote-vs-code/architecture-ssh.png", alt="Remote SSH Architecture") }}](https://code.visualstudio.com/blogs/2019/07/25/remote-ssh)

Over the weekend I set up a VM in both Azure and DigitalOcean as a test for using the [Remote - SSH extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh). Microsoft's [getting started instructions](https://code.visualstudio.com/remote-tutorials/ssh/getting-started) were clear and easy to follow.

[{{ img(src="./blog/remote-vs-code/vscode-ssh-ext.png", alt="VS Code SSH Ext") }}](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

When following the guide Azure warns that leaving port 22 open isn't a great idea.

{{ img(src="./blog/remote-vs-code/azure-port-22-warning.png", alt="Azure Port 22 Warning") }}

## Zero Trust SSH With Cloudflare

To secure your SSH connection using Cloudflare, create a free account, set up a domain, and enable their Access and Argo Tunnel products in your account. To create an account and configure a domain, follow [these instructions](https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website).

Cloudflare Access integrates with existing identity providers and will allow you to control who can access a remote VM made available through a subdomain of your site. For this example, you should be able to use the free allocation of Acess, particularly if you can Google, GitHub, FaceBook, or One-Time Pin as your identity provider.

An instance of Cloudflare's Argo Tunnel runs on both the client and server to facilitate the secure SSH session, allowing you to block all inbound ports to your VM. The configuration leverages the built-in SSH ProxyCommand capability, so once configured, you connect to the server using the typical SSH commands.

Argo Tunnel will [cost you some money](https://support.cloudflare.com/hc/en-us/articles/115000224192-Billing-for-Argo-) - at the time of writing, $5/mo per domain, along with a usage fee of $0.10 per gigabyte of data transfer, with the first GB being free.

[{{ img(src="./blog/remote-vs-code/access-pricing.png", alt="Cloudflare Access") }}](https://www.cloudflare.com/products/cloudflare-access/)

Follow [these instructions](https://developers.cloudflare.com/access/ssh/protecting-ssh-server/) to setup Access and install and configure Argo Tunnel your development VM. The easiest identity provider to setup is One Time Pin with an Access Control Policy configured to only allow only your email account.

[Install and run cloudflared as a service](https://developers.cloudflare.com/argo-tunnel/reference/service/) on your Linux VM. To check the status of the service:

```bash
sudo service cloudflared status
```

And to get it running the first time after you install the service:

```bash
sudo service cloudflared start
```

Then, install Cloudflare on your local machine using [these instructions](https://developers.cloudflare.com/access/ssh/connect-ssh/). This guide provides instructions for both leveraging your existing SSH certificate to connect to the host or use short-lived certificates. I was unable to get short-lived certificates working with VS Code, so I recommend skipping that option for now.

Once complete, test your connection by first trying to open an SSH connection to your VM in your terminal. Then go ahead and create a new SSH connection in VS Code using your new Cloudflare-based endpoint.

Presuming that works, disable all inbound ports for your VM. To do this, go into the Azure portal, open the network security group associated with your VM and delete the inbound security rule allowing SSH over port 22. This ensures that the only way to create an SSH connection is through Cloudflare.

Lastly, since VS Code automatically edits your SSH config file, you may have multiple entries for your host and may want to tidy it up a bit. You should be able to consolidate it so it looks something like this:

```bash
Host vm.yourdomain.com
  ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
  IdentityFile ~/.ssh/yourcert
  User youruser
  HostName vm.yourdomain.com
```

If you set this up and come back in a day or more and wonder why you are having trouble connecting, if you followed the getting started guide, you may have configured the VM to turn off in the evenings. So, you may need to login to the Azure portal and fire the VM back up.

Also, because the VS Code SSH connection process is a bit impatient and not wait for the authentication process to complete, it may be best to first authenticate a new session with Cloudflare via terminal, then switch over to VS Code.

## Conclusion

The ideas represented here could be generalized and applied for virtual machines hosted by other cloud providers. I look forward to seeing the VS Code tooling surrounding this continue to mature. Being able to have specific, shared virtual machine or container-based configurations per project should provide a lot of confidence for development teams who work on a wide variety of projects or code repositories that aren't touched often.
