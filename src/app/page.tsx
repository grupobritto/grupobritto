import Image from 'next/image';

export default function Justifica() {
  return (
    <>
      <main>
        <div className="">
          <div className="flex-1">
            <Image
              src="/logo-prefeitura.png"
              alt=""
              className="m-auto mb-5"
              width={200}
              height={200}
            />
            <div className="mb-15">
              <div>
                <p className="text-center">Balneário Gaivota - SC</p>
                <p className="text-center">Recursos Humanos</p>
              </div>
              <h1 className="mt-1 text-center font-bold uppercase">Justificativa de Ponto</h1>
            </div>
            <div className="flex justify-between">
              <div className="">
                <div className="flex space-x-1">
                  <span className="">
                    Nome do funcionario:{' '}
                    <span className="font-bold">Mauricio Britto de Oliveira</span>
                  </span>
                </div>
                <div className="flex space-x-1">
                  <span className="">
                    Cargo que ocupa: <span className="font-bold">VIGIA</span>
                  </span>
                </div>
                <div className="flex space-x-1">
                  <span className="">
                    Local que atua: <span className="font-bold">Zenita Mendes da Silva Pedro</span>
                  </span>
                </div>
              </div>
              <div className="">
                <span className="">Data de preenchimento do formulário</span>
                <h1 className="font-bold uppercase">‎ </h1>
                <input
                  type="date"
                  className="w-64 rounded font-bold text-zinc-900 focus-within:outline-none"
                />
              </div>
            </div>
            <hr className="my-2" />
            <div className="">
              <span className="font-normal">Destino da Solicitação</span>
              <br />
              <span className="font-bold">Departamento de Recursos Humanos</span>
            </div>
            <hr className="my-2" />
            <div className="my-4">
              <div>
                <span className="">Dia: </span>
                <input
                  type="date"
                  className="rounded font-bold text-zinc-900 focus-within:outline-none"
                />
                <span className="text-xs font-semibold">(dia do fato)</span>
              </div>
              <span className="text-base font-medium">
                Assinalar o campo que não houve registo de ponto e preencher o horário cumprido.
              </span>
            </div>
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Entrada matutina:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Entrada vespertina:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Entrada noturna:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">
                    Atestado médico <span className="font-bold">(anexar)</span>
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Saida matutina:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Saida vespertina:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="size-5" />
                  <span className="text-center leading-tight">Saida noturna:</span>
                  <input
                    type="time"
                    className="w-32 rounded font-bold text-zinc-900 focus-within:outline-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="size-5" />
                    <span className="text-center leading-tight">Matutino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="size-5" />
                    <span className="text-center leading-tight">Vespertino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="size-5" />
                    <span className="text-center leading-tight">Integral</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="size-5" />
                    <span className="text-center leading-tight">Noturno</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="">
                Motivo <span className="text-sm text-zinc-400">(obrigatório)</span>
              </span>
              <textarea className="mt-2 h-48 w-full resize-none rounded text-zinc-400"></textarea>
            </div>
            <div className="">
              <span className="text-[14px] text-zinc-400">
                Estou ciente que esta justificatia será analisada, podendo ser justificada e
                abonada, ou justificada e não abonada, conforme previsto na legislação vigente
              </span>
              <br />
            </div>
            <div className="mt-2">
              <span className="">
                Balneário Gaivota, <input type="date" className="rounded font-bold text-zinc-900" />
              </span>
            </div>
            <div className="mb-15">
              <span className="">Assinatura do funcionário:</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="my-4">
              <h1 className="mb-6 text-lg">Visto Funcionário/RH: </h1>
              <div className="mt-14">
                <span className="text-sm">
                  __________________________________________ ____/____/____{' '}
                  <span className="font-bold">(data)</span>
                </span>
              </div>
              <span className="text-[13px]">Protocolo do Dep. de Recursos Humanos</span>
            </div>
            <div className="my-5 flex-col items-center space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="size-5" />
                <span className="text-center leading-tight">Justifcada e abonada</span>
              </div>
              <div className="mb-6 flex items-center gap-2">
                <input type="checkbox" className="size-5" />
                <span className="text-center leading-tight">Justifcada e não abonada</span>
              </div>
              <div className="mt-14">
                <span className="mb-6 text-sm">
                  __________________________________________ ____/____/____{' '}
                  <span className="font-bold">(data)</span>
                </span>
              </div>
              <span className="text-[13px]">Secretário(a) da Saúde</span>
            </div>
          </div>
          <hr className="my-2" />
          <div className="space-y-5">
            <h1>
              Observações Responsável pela informação:{' '}
              <span className="text-xs">(preenchimento obrigatório)</span>
              <br />
              <span className="mb-4 w-full">
                ________________________________________________________________________________________________________________________________________________
              </span>
              <br />
              <span className="w-full">
                ________________________________________________________________________________________________________________________________________________
              </span>
              <br />
              <span className="w-full">
                ________________________________________________________________________________________________________________________________________________
              </span>
              <br />
              <span className="w-full">
                ________________________________________________________________________________________________________________________________________________
              </span>
            </h1>
            <div className="my-5">
              <span className="">Assinatura do Responsável pela informação</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
