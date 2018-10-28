
echo "Current OS is: ${OSTYPE}"
if [[ "${OSTYPE}" == darwin* ]]
  then
    echo "Switching to using gsed"
    export SED=gsed
fi

export SED=${SED:-sed}
