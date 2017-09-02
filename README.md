# NETPIE

## Installation

### Using `npm`

	$ npm install -g netpie-auth
	$ netpie-auth

### Using `docker `

on time generation (container will be destroyed after CTRL -C)
	
	$ docker run --rm -it cmmc/netpie-auth
	
run as background container (netpie credentials cached inside container)
	
	$ docker run -d -name netpie-auth-container cmmc/netpie-auth
	$ docker exec -it netpie-auth-container netpie-auth
	$ # tips
	$ alias netpie-auth="docker exec -it netpie-auth-container netpie-auth"
	$ netpie-auth


### cli 

	$ netpie-auth --help
	$ netpie-auth -i CMMCIO -k NhPwKvkJFLXYGfd -s G5mY73QQK18g9js7ffDJnJt4t2
	$ netpie-auth --id CMMCIO --key NhPwKvkJFLXYGfd --secret G5mY73QQK18g9js7ffDJnJt4t2
