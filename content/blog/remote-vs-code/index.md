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

Microsoft recently released an exciting [set of capabilities](https://code.visualstudio.com/docs/remote/ssh) that allows a locally running instance of VS Code to attach to a remote VM or container that serves as the development environment. This allows the benefit of authoring code in a locally running instance of VS Code while moving the compute to a remote host providing the power and unique configuration settings for your project. Over the weekend I set up a VM in both Azure and DigitalOcean as a test for using the [Remote - SSH extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh). Microsoft's [getting started instructions](https://code.visualstudio.com/remote-tutorials/ssh/getting-started) were clear and easy to follow, but a bit loose on security - notably leaving port 22 exposed publicly for SSH. This gave me the chance to try out [Cloudflare Access](https://teams.cloudflare.com/access/) and [Argo Tunnel](https://www.cloudflare.com/products/argo-tunnel/) for zero-trust security with SSH.

<!-- more -->

Using virtual machines for development also allows experimentation with new configurations or libraries without fear of breaking your local setup or introducing security vulnerabilities. This can also be helpful those who enjoy hacking on a Raspberry Pi, providing a nice way of using your main computer with VS Code to develop your scripts on the Raspberry Pi without the need for finding a separate display or using VNC.

Earlier this year I ran into a [post by Fatih Arslan](https://arslan.io/2019/01/07/using-the-ipad-pro-as-my-development-machine/), the original author of [vim-go](https://github.com/fatih/vim-go), about his experiment using an iPad Pro for development by leveraging remote virtual machines and containers hosted on DigitalOcean. His post inspired me to experiment with this type of setup using my Google Pixelbook, which I ended up using for half of 2019. However, there were a few downsides inherent in the architecture, a large one being that you are working in a code editor running on the host instead of your local machine, inevitably leading to the feeling of lag while typing.

## VS Code Remote SSH Extension

The VS Code extension architecture looks like this:

[{{ img(src="./blog/remote-vs-code/architecture-ssh.png", alt="Remote SSH Architecture") }}](https://code.visualstudio.com/blogs/2019/07/25/remote-ssh)

The first step to getting started in to install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh).

[{{ img(src="./blog/remote-vs-code/vscode-ssh-ext.png", alt="VS Code SSH Ext") }}](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

Then follow Microsoft's [getting started instructions](https://code.visualstudio.com/remote-tutorials/ssh/getting-started), which walks you through creating a virtual machine in Azure and configuring the VS Code extension for connecting to it via SSH. When following the guide you'll notice that Azure warns that leaving port 22 open isn't a great idea.

{{ img(src="./blog/remote-vs-code/azure-port-22-warning.png", alt="Azure Port 22 Warning") }}

## Zero Trust SSH With Cloudflare

Cloudflare can be used to create a zero trust configuration for the SSH connection between your local machine and the VM in Azure. To get started, create a free Cloudflare account, set up a domain, and enable the Access and Argo Tunnel products in your account. [These instructions](https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website) detail how to create an account and configure a domain.

Cloudflare Access integrates with existing identity providers and allow you to control who can access resources associated with your domain. In this case, we'll setup a subdomain that will resolve to the the remote VM. For this example, you should be able to use the free allocation of Access, which gives you the options of choosing Google, GitHub, Facebook, or One-Time Pin as the identity provider.

An instance of Cloudflare's Argo Tunnel runs on both the client and server to facilitate the secure SSH session, allowing us to block all inbound ports to the VM. The configuration leverages the ProxyCommand capability built in to SSH, so once configured, you are able to connect to the server using the native SSH commands.

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

Next, install Cloudflare on your local machine using [these instructions](https://developers.cloudflare.com/access/ssh/connect-ssh/). Once complete, test your connection by first trying to open an SSH connection to your VM in your terminal. Then create a new SSH connection in VS Code using your new Cloudflare-based endpoint.

Presuming that works, disable all inbound ports for your VM. To do this, go into the Azure portal, open the network security group associated with your VM and delete the inbound security rule allowing SSH over port 22. This ensures that the only way to create an SSH connection is through Cloudflare.

Lastly, since VS Code automatically edits your SSH config file, you may have multiple entries for your host and may want to tidy it up a bit. You should be able to consolidate it so it looks something like this:

```bash
Host vm.yourdomain.com
  ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
  IdentityFile ~/.ssh/yourcert
  User youruser
  HostName vm.yourdomain.com
```

If you set this up and come back in a day or more and wonder why you are having trouble connecting, if you followed the getting started guide, you may have configured the VM to turn off in the evenings. So, you may need to login to the Azure portal and fire the VM back up. Also, because the VS Code SSH connection process is a bit impatient and not wait for the authentication process to complete, it may be best to first authenticate a new session with Cloudflare via terminal, then switch over to VS Code.

## Conclusion

The ideas represented here could be generalized and applied for virtual machines hosted by other cloud providers. I look forward to seeing the VS Code tooling surrounding this continue to mature. Being able to have specific, shared virtual machine or container-based configurations per project should provide a lot of confidence for development teams who work on a wide variety of projects or code repositories that aren't touched often. [Facebook announced a partnership](https://developers.facebook.com/blog/post/2019/11/19/facebook-microsoft-partnering-remote-development/) in the continued development of this functionality, so I'm hoping that means it will rapidly mature.
