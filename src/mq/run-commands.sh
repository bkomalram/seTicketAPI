
for cmd in "$@"; do {
  echo "Process \"$cmd\" started";
  $cmd & pid=$!
  PID_LIST+=" $pid";
} done

trap "kill $PID_LIST" SIGINT

echo "Procesamiento paralelo a iniciado";

wait $PID_LIST

echo
echo "Procesamiento paralelo finalizado";