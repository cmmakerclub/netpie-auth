# NETPIE-auth

## Usage
	$ netpie-auth

This command will generate username and password from your app\_id, app\_key, and app\_secret then save file as **netpie-auth_[your app id].json** in your **current directory**.

To view file that save in current directory use
	
	$ netpie-auth --list

This command will get all file that contain name **netpie-auth_[xxx]** and read these files.

For more infomation please use

	$ netpie-auth --help


## Installation

### Using `npm`

	$ npm install -g netpie-auth
	$ netpie-auth

### Using `docker `

on time generation (container will be destroyed after CTRL -C)
	
	$ docker run --rm -it cmmc/netpie-auth
	
run as background container (netpie credentials cached inside container)
	
	$ docker run -d -it --name netpie-auth-container cmmc/netpie-auth
	$ docker exec -it netpie-auth-container netpie-auth
	
### aliasing

	$ alias netpie-auth="docker exec -it netpie-auth-container netpie-auth"
	$ netpie-auth


### cli 

	$ netpie-auth --help
	$ netpie-auth -i CMMCIO -k NhPwKvkJFLXYGfd -s G5mY73QQK18g9js7ffDJnJt4t2
	$ netpie-auth --id CMMCIO --key NhPwKvkJFLXYGfd --secret G5mY73QQK18g9js7ffDJnJt4t2

### List
	$ netpie-auth --list
