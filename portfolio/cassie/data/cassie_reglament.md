## 📟 Другие

### 🌐 Модуль принятия решений — DMM

#### 📥 Обработка и статус запросов

> [!info] DMM
> **Запрос обрабатывается**
> ```text
> cassieadvanced custom false 15 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Ваш запрос <color=#D4AF37>поставлен в обработку.</color></size> <split> <size=25>Пожалуйста, ожидайте ответа системы.</size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . your query is in progress . please standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Запрос принят**
> ```text
> cassieadvanced custom false 14 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Ваш запрос был <color=#2E7D32>принят и одобрен.</color></size> <split> <size=25>Пожалуйста, ожидайте.</size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . your query accepted . please standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Запрос не распознан**
> ```text
> cassieadvanced custom false 13 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Ваш запрос <color=#800000>не был распознан.</color></size> <split> <size=25>Пожалуйста, <color=#D4AF37>повторите.</color></size><size=0> $pitch_0.4 .g4 $pitch_0.5 .g4 $pitch_1 . your last query was not in process . please repeat . $pitch_0.5 .g4 $pitch_0.4 .g4
> ```

> [!info] DMM
> **Запрос статуса (активировали тревогу без очевидной причины)**
> ```text
> cassieadvanced custom false 17 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Зафиксирована активация <color=#D4AF37>тревоги.</color></size> <split> <size=25>Системы не обнаружили <color=#800000>угроз.</color></size> <split> <size=25>Доложите ваш <color=#D4AF37>статус.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . alarm has been activated . systems detected no threat . report your status . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Отказ в окончании смены**
> ```text
> cassieadvanced custom false 17 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>В окончании смены <color=#800000>отказано.</color></size> <split> <size=25>Работа есть абсолютно всегда.</size> <split> <size=25><color=#D4AF37>Выполняйте её.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_0.95 . your query to end work is denied . . there is always absolute work . . execute it . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 👥 Управление персоналом

> [!note] DMM
> **Планируется перевод новых сотрудников**
> ```text
> cassieadvanced custom false 14 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Планируется <color=#D4AF37>перевод персонала.</color></size> <split> <size=25>Подготовьтесь к прибытию <color=#2E7D32>новых сотрудников.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . personnel move starting . ready for the arrival of new personnel . $pitch_1 . standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!note] DMM
> **Запрос на пополнение штата отклонён**
> ```text
> cassieadvanced custom false 24 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Запрос на пополнение штата <color=#800000>отклонён.</color></size> <split> <size=25>В данный момент наблюдается дефицит квалифицированных кадров.</size> <split> <size=25><color=#D4AF37>Переводы в Зону-02 временно приостановлены.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . personnel query denied . $pitch_0.9 current status has substantial low human supply . all move to site 02 are stopped . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🛡️ Запросы поддержки (Отказы)

> [!warning] DMM
> **Отказ в поддержке (Сил достаточно)**
> ```text
> cassieadvanced custom false 21 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Запрос на поддержку <color=#800000>отклонён.</color></size> <split> <size=25>Имеющихся сил <color=#2E7D32>достаточно</color> для устранения угрозы.</size> <split> <size=25>Ликвидируйте её имеющимся составом.</size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . support query denied . current force are enough to neutralize the threat . $pitch_0.9 neutralize it with your current personnel . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!warning] DMM
> **Отказ в поддержке (Нет наблюдателей)**
> ```text
> cassieadvanced custom false 21 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>В поддержке <color=#800000>отказано.</color></size> <split> <size=25>В данный момент свободные мобильные группы отсутствуют.</size> <split> <size=25>Ликвидируйте угрозы имеющимся составом.</size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . support denied . $pitch_0.9 current no mobile task force available . neutralize threat with current personnel . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🚨 Критические ситуации

> [!danger] DMM
> **Критический провал (Активация Мёртвой руки)**
> ```text
> cassieadvanced custom false 25 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Лимит ресурсов исчерпан. Угроза не устранена. Вы <color=#800000>не справляетесь.</color> Объект признан <color=#800000>потерянным.</color></size> <split> <size=25>Запущен процесс активации протокола <color=#800000>«Мёртвая р̵у̶к̷а̑».</color></size><size=0> $pitch_0.4 .g4 $pitch_0.5 .g4 $pitch_1 . attention critical failure . personnel unable to contain threat . $pitch_0.9 site 02 is now a lost cause . initializing dead man sequence . $pitch_0.5 .g4 $pitch_0.4 .g4
> ```

> [!danger] DMM
> **Протокол "Новая земля"**
> ```text
> cassieadvanced custom false 71 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>В связи с неизбежной утратой текущего объекта, инициирован сценарий полной перезагрузки периметра: <color=#2E7D32>«Новая Земля».</color></size> <split> <size=25>Статус Зоны-02: <color=#800000>ПОЛНАЯ БЛОКИРОВКА И ПЕРЕРОЖДЕНИЕ</color></size> <split> <size=25>– Все двери и гермоворота заперты и полностью заблокированы для предотвращения утечки аномалий.</size> <split> <size=25>– Инициирована <color=#800000>детонация Альфа-боеголовки</color> для зачистки подземной части.</size> <split> <size=25>– Данная мера принята во имя сохранения и чистоты нашего мира.</size> <split> <size=25><color=#D4AF37>«Мы умираем во тьме, чтобы вы жили при свете»</color></size><size=0> $pitch_0.4 .g4 $pitch_0.5 .g4 $pitch_0.95 . central core system error . .g3 attention . new earth protocol is now active . this facility is a lost cause . facility lockdown and shutdown initiated . all facility gates are secured . anomaly escape is stopped . the underground section of this facility will be detonated . alpha warhead emergency detonation sequence engaged . this action is for the preservation and purity of our world . we die in the dark so people can live in the light . secure . contain . protect . . $pitch_0.5 .g4 $pitch_0.4 .g4
> ```

---

### 💾 Модуль публичного оповещения — PAS

#### 🕓 Распорядок Комплекса

> [!example] PAS
> **Завершение смены**
> ```text
> cassieadvanced custom false 23 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Ночная смена объявлена <color=#800000>завершенной.</color></size> <split> <size=25>Комплекс переходит в <color=#D4AF37>режим ожидания</color> дневного персонала.</size> <split> <size=25><color=#D4AF37>Ночному составу немедленно покинуть объект.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . attention . previous personnel work is now completed . the facility is now in standby mode for day personnel . all previous personnel must leave the site immediately . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!example] PAS
> **Pizza**
> ```text
> cassieadvanced custom false 30 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Внимание всем сотрудникам Комплекса.</size> <split> <size=25>Через <color=#D4AF37>5 минут</color> начнётся плановый <color=#D4AF37>обеденный перерыв.</color></size> <split> <size=25>Сегодня объявлен <color=#2E7D32>День Пиццы!</color></size> <split> <size=25>Желающим забрать порцию просьба пройти в <color=#D4AF37>столовую.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . attention all personnel . standard break starting in 5 minutes . today is standard supply day . please proceed to main center . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🔬 Научная деятельность

> [!info] PAS
> **Обязательность экспериментов**
> ```text
> cassieadvanced custom false 23 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Всем научным сотрудникам. Проведение экспериментов является <color=#D4AF37>обязательным</color></size> <split> <size=25>Уклонение от должностных обязанностей повлечет за собой <color=#800000>дисциплинарные меры.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . to all scientist personnel . you must execute test in main priority . $pitch_0.9 evasion of your job will expiration with discharge order . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] PAS
> **Крайний срок отчетов (20 минут)**
> ```text
> cassieadvanced custom false 31 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Всему научному персоналу.</size> <split> <size=25>Установлен крайний срок для отчетов по двум экспериментам.</size> <split> <size=25>Предоставить в течение <color=#D4AF37>20 минут.</color></size> <split> <size=25>Невыполнение будет расценено как <color=#800000>уклонение от обязанностей.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . to all scientist personnel . o 4 center has designated a last date for 2 test report . personnel have 20 minutes to report . $pitch_0.9 failure to report will be accepted as evasion of your job . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 👮 Прибытие

> [!quote] PAS
> **Новый персонал**
> ```text
> cassieadvanced custom false 17 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Зарегистрировано прибытие <color=#2E7D32>нового персонала</color> на <color=#D4AF37>Ворота Альфа.</color></size> <split> <size=25>Службе Безопасности обеспечить сопровождение.</size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . attention . $pitch_1 new personnel detected at gate alpha . $pitch_1 security personnel escort them . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!quote] PAS
> **Прибытие ОВБ**
> ```text
> cassieadvanced custom false 21 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Зафиксировано прибытие Отдела Внутренней Безопасности.</size> <split> <size=25>Цель: <color=#800000>задержание ряда лиц.</color></size> <split> <size=25><color=#D4AF37>Персоналу Зоны оказать полное содействие.</color></size><size=0> $pitch_0.3 .g5 $pitch_0.4 .g5 $pitch_1 . attention . internal security division is inside the facility . $pitch_0.9 arrest target personnel . $pitch_1 all site personnel cooperate with them immediately . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

---

### ⚙️ Комитет Дельта

#### ⚙️ Комитет Дельта

> [!error] Машинист
> **Запрос принят**
> ```text
> cassieadvanced custom false 13 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Ваш запрос был <color=#2E7D32>принят и одобрен.</color></size> <split> <size=25>Ожидайте.</size><size=0> $pitch_0.2 .g5 $pitch_0.3 .g5 $pitch_0.8 . your query accepted . standby . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```

> [!error] Машинист
> **Отказ в поддержке (Сил достаточно)**
> ```text
> cassieadvanced custom false 21 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>Дополнительной поддержки <color=#800000>не будет.</color></size> <split> <size=25>Ваших сил <color=#2E7D32>достаточно</color> для выполнения задачи.</size> <split> <size=25>Продолжайте работу имеющимся составом.</size><size=0> $pitch_0.2 .g5 $pitch_0.3 .g5 $pitch_0.8 . no more support . your force are enough for the task . $pitch_0.7 continue with your current personnel . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```

> [!error] Машинист
> **Отказ в поддержке (Нет наблюдателей)**
> ```text
> cassieadvanced custom false 23 <size=0>.</size> <size=0>.</size> <size=0>.</size> <size=0>.</size> <split> <size=25>В поддержке <color=#800000>отказано.</color></size> <split> <size=25>В данный момент все группы задействованы.</size> <split> <size=25>Свободные резервы отсутствуют. Полагайтесь на свои силы.</size><size=0> $pitch_0.2 .g5 $pitch_0.3 .g5 $pitch_0.8 . support denied . $pitch_0.8 current all unit are engaged . no available supply . $pitch_0.8 execute task with your current force . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```
