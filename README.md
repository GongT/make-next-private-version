# @microduino-private/make-private-version
** Project Name **

### requirements
* commands `node`(or `nodejs`), `npm`, `git`, `docker` are available in `PATH`   
* service `docker-engine` is running
* folder `/data/service` is writable   
* npm package `json-env-cli`, `micro-build` are installed globally    
    (install with: `sudo npm install -g json-env-cli micro-build`)

ubuntu: `realpath` command is also required.

#### document about `jenv` (json-env-cli)
https://github.com/GongT/jenv.git

### get service source 
*(and optional, deploy a docker container)*

```bash
microbuild clone git@github.com/this-project-url.git
```

Log will look like:
```txt
---- running logs ----

please answer interact questions:
> xxx <Enter>

---- running logs ----

Some information:
	xxxxxxxx

Everything ok, Enjoy!
```

### upgrade online instance on server

1. drop any local changes
1. git pull
1. run build process

as you see, **<span style="color:red;font-weight:bold">this will remove all local change</span>**, so it's limited to run on `online` branch

**<span style="color:red;font-weight:bold">never</span>** checkout `online` branch while local developing


```bash
cd /data/service/this-project-name
microbuild upgrade
```


### push source to `online` branch

```bash
git push origin master:online
```

### service control (on deploy server)
most linux system:
* start  : `systemctl start this-project-name`
* stop   : `systemctl stop this-project-name`
* restart: `systemctl restart this-project-name`

some old ubuntu: (without systemd)
* start  : `service this-project-name start`
* stop   : `service this-project-name stop`
* restart: `service this-project-name restart`

compatible:
* start  : `micro-build service start`
* stop   : `micro-build service stop`
* restart: `micro-build service restart`


### debug run in host machine

speedup developing!

```bash
npm install    # required only first time
micro-build start
```

### debug run in docker

local testing, the result will same as server! (but config file is different)

```bash
micro-build build
```
