# Copyright Zhigui.com. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env bash

file=$1

if [ ! -f "$file" ]; then
    echo "$file does not exist"
    exit 1
fi

while read -r host
do
    echo "The host is $host"
	sshpass -p 'FaVm&zu2mxFtkGwK' ssh -n $host "docker ps -qa | xargs docker rm -f"
	echo "finish the remote task"
done < "$file"

