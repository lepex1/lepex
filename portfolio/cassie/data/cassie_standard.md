## 📟 Стандартные

### 🌐 Модуль принятия решений — DMM

#### 📥 Обработка и статус запросов

> [!info] DMM
> **Запрос обрабатывается**
> ```text
> cassieadvanced custom false 9 <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Ваш запрос <color=yellow>поставлен в обработку.</color><br><size=0>............</size><br><color=white>Пожалуйста, ожидайте ответа системы.</color><size=0> $pitch_1 your query is in progress . please standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Запрос принят**
> ```text
> cassieadvanced custom false 8 <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Ваш запрос был <color=green>принят и одобрен</color>.<br><size=0>............</size><br>Пожалуйста, ожидайте.<size=0> $pitch_1 your query accepted . please standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Запрос не распознан**
> ```text
> cassieadvanced custom false 10 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Ваш запрос <color=red><b>не был распознан</b></color>.<br><size=0>........................................</size><br><color=white>Пожалуйста, <color=yellow>повторите</color>.</color><size=0> $pitch_1 your last query was not in process . please repeat . $pitch_0.5 .g4 $pitch_0.4 .g4
> ```

> [!info] DMM
> **Запрос статуса (активировали тревогу без очевидной причины)**
> ```text
> cassieadvanced custom false 10 <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Зафиксирована активация <color=yellow>тревоги</color>.<br><size=0>........................................</size><br>Системы не обнаружили <color=red>угроз</color>. Доложите ваш <color=yellow>статус</color>.</color><size=0> $pitch_1 alarm has been activated . systems detected no threat . report your status . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] DMM
> **Отказ в окончании смены**
> ```text
> cassieadvanced custom true 9 <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></u></color><br><color=white>В окончании смены <color=red><b>отказано</b></color>.<br><size=0>........................................</size><br><color=white>Работа есть абсолютно всегда.</color><br><size=0>........................................</size><br><color=orange><b>Выполняйте её.</b></color></color><size=0> $pitch_1.1 .g3 . $pitch_0.95 your query to end work is denied . . there is always absolute work . . execute it . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 👥 Управление персоналом

> [!note] DMM
> **Планируется перевод новых сотрудников**
> ```text
> cassieadvanced custom true 8 <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Планируется <color=yellow>перевод персонала</color>.<br><size=0>........................................</size><br>Подготовьтесь к прибытию <color=green>новых сотрудников</color>.</color><size=0> $pitch_1 personnel move starting . ready for the arrival of new personnel . $pitch_1 . standby . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!note] DMM
> **Запрос на пополнение штата отклонён**
> ```text
> cassieadvanced custom false 19 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Запрос на пополнение штата <color=red><b>отклонён</b></color>.<br><size=0>........................................</size><br><color=white>В данный момент наблюдается дефицит квалифицированных кадров.<br><size=0>........................................................................</size><br><color=orange>Переводы в Зону-02 временно приостановлены</color>.<size=0> $pitch_1.15 .g3 .g2 . . .g5 .g3 . . $pitch_1 personnel query denied . $pitch_0.9 current status has substantial low human supply . all move to site 02 are stopped . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🛡️ Запросы поддержки (Отказы)

> [!warning] DMM
> **Отказ в поддержке (Сил достаточно)**
> ```text
> cassieadvanced custom false 16 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Запрос на поддержку <b><color=red>отклонён</b></color>.<br><size=0>........................................</size><br><color=white>Имеющихся сил <color=green>достаточно</color> для устранения угрозы.<br><size=0>........................................................................</size><br>Ликвидируйте её имеющимся составом.</color><size=0> $pitch_1.15 .g3 .g2 . . .g5 .g3 . . $pitch_1 support query denied . current force are enough to neutralize the threat . $pitch_0.9 neutralize it with your current personnel . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!warning] DMM
> **Отказ в поддержке (Нет наблюдателей)**
> ```text
> cassieadvanced custom false 16 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>В поддержке <color=red><b>отказано</b></color>.<br><size=0>........................................</size><br>В данный момент свободные мобильные группы отсутствуют.<br><size=0>........................................................................</size><br>Ликвидируйте угрозы имеющимся составом.<size=0> $pitch_1.15 .g3 .g2 . . .g5 .g3 . . $pitch_1 support denied . $pitch_0.9 current no mobile task force available . neutralize threat with current personnel . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🚨 Критические ситуации

> [!danger] DMM
> **Критический провал (Активация Мёртвой руки)**
> ```text
> cassieadvanced custom true 19 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль DMM]</b></color></u><br><color=white>Лимит ресурсов исчерпан.</color><br><size=0>........................................</size><br><color=white>Угроза не устранена.<br>Вы <color=red><b>не справляетесь</b></color>. Объект признан <color=red><b>потерянным</b></color>.<br><size=0>........................................................................</size><br><color=orange>Запущен процесс активации протокола «Мёртвая рука».</color><size=0> $pitch_0.9 .g3 .g2 . . .g5 .g3 . . $pitch_1 attention critical failure . personnel unable to contain threat . $pitch_0.9 site 02 is now a lost cause . initializing dead man sequence . $pitch_0.5 .g4 $pitch_0.4 .g4
> ```

> [!danger] DMM
> **Протокол "Новая земля"**
> ```text
> cassieadvanced custom true 70 <align=center><size=22><color=#A6E3F7><b><u>[Модуль PAS]</u></b></color></size><br><size=15><b><color=grey>Статус: Критическая перестройка // Лог директивы 05</color></b><br><br><size=0>........................................................................................................................</size><br><size=15><color=green><b>[ ВНИМАНИЕ: АКТИВИРОВАН ПРОТОКОЛ «НОВАЯ ЗЕМЛЯ» ]</b></color></size><br><size=0>......................................................................</size><br><size=15><color=white>В связи с неизбежной утратой текущего объекта, инициирован сценарий полной перезагрузки периметра: <color=green>«Новая Земля»</color>.<br><size=0>..........................................................................................</size><br><b>Статус Зоны-02: <color=red>ПОЛНАЯ БЛОКИРОВКА И ПЕРЕРОЖДЕНИЕ</color></b><br><size=0>..............................................................................................................</size><br>– Все двери и гермоворота заперты и полностью заблокированы для предотвращения утечки аномалий.<br><size=0>..........................................................................................</size><br>– Инициирована <color=red>детонация Альфа-боеголовки</color> для зачистки подземной части.<br><size=0>....................................................................................................</size><br>– Данная мера принята во имя сохранения и чистоты нашего мира.<br><br><size=0>............................................................................................................................................</size><br><i><b><color=yellow>«Мы умираем во тьме, чтобы вы жили при свете»</color></b></i></color></size><size=0> .g4 .g5 $pitch_0.95 central core system error . .g3 attention . new earth protocol is now active . this facility is a lost cause . facility lockdown and shutdown initiated . all facility gates are secured . anomaly escape is stopped . ... (line truncated to 2000 chars)
> ```

---

### 💾 Модуль публичного оповещения — PAS

#### 🕓 Распорядок Комплекса

> [!example] PAS
> **Завершение смены**
> ```text
> cassieadvanced custom true 15 <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br>Ночная смена объявлена <b><color=red>завершенной</color></b>.<br><size=0>........................................</size><br>Комплекс переходит в <b><color=#F0E68C>режим ожидания</color></b> дневного персонала.<br><size=0>........................................................................</size><br><b><color=orange>Ночному составу немедленно покинуть объект.</color></b><size=0> $pitch_1 attention . previous personnel work is now completed . the facility is now in standby mode for day personnel . all previous personnel must leave the site immediately . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!example] PAS
> **Pizza**
> ```text
> cassieadvanced custom true 21 <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br><color=white>Внимание всем сотрудникам Комплекса.<br><size=0>........................................</size><br>Через <color=yellow>5 минут</color> начнётся плановый <color=orange>обеденный перерыв</color>.<br><size=0>........................................</size><br>Сегодня объявлен <color=green>День Пиццы</color>!<br><size=0>........................................</size><br>Желающим забрать порцию просьба пройти в <color=yellow>столовую</color>.</color><size=0> .g3 $pitch_1 attention all personnel . standard break starting in 5 minutes . today is standard supply day . please proceed to main center . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 🔬 Научная деятельность

> [!info] PAS
> **Обязательность экспериментов**
> ```text
> cassieadvanced custom true 19 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br><color=white>Всем научным сотрудникам. Проведение экспериментов является <color=yellow>обязательным</color><br><size=0>........................................................................</size><br><color=white>Уклонение от должностных обязанностей повлечет за собой <color=red><b>дисциплинарные меры.</b></color><size=0> $pitch_1.15 .g3 .g2 . . .g5 .g3 . . .g6 .g3 . . $pitch_1 to all scientist personnel . you must execute test in main priority . $pitch_0.9 evasion of your job will expiration with discharge order . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!info] PAS
> **Крайний срок отчетов (20 минут)**
> ```text
> cassieadvanced custom true 24 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br><color=yellow>Всему научному персоналу.<br><size=0>........................................</size><br><color=white>Установлен крайний срок для отчетов по двум экспериментам.<br><size=0>........................................................................</size><br><color=white>Предоставить в течение <color=yellow>20 минут</color>.<br><size=0>........................................</size><br>Невыполнение будет расценено как <color=red><b>уклонение от обязанностей</b></color>.<size=0> $pitch_1.15 .g3 .g2 . . .g5 .g3 . . .g6 .g3 . . $pitch_1 to all scientist personnel . o 4 center has designated a last date for 2 test report . personnel have 20 minutes to report . $pitch_0.9 failure to report will be accepted as evasion of your job . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

#### 👮 Прибытие

> [!quote] PAS
> **Новый персонал**
> ```text
> cassieadvanced custom true 12 <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br>Зарегистрировано прибытие <b><color=#4DFFB8>нового персонала</color></b><br><size=0>........................................</size><br>на <b><color=#F0E68C>Ворота Альфа</color></b>.<br><size=0>........................................</size><br>Службе Безопасности обеспечить сопровождение.</color></b><size=0> $pitch_1.1 .g1 . $pitch_1 attention . $pitch_1 new personnel detected at gate alpha . $pitch_1 security personnel escort them . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

> [!quote] PAS
> **Прибытие ОВБ**
> ```text
> cassieadvanced custom true 14 <size=0>.</size> <size=0>.</size> <align=center><size=21><color=#A6E3F7><u><b>[Модуль PAS]</b></color></u><br>Зафиксировано прибытие <b><color=#708090>Отдела Внутренней Безопасности</color></b>.<br><size=0>........................................</size><br>Цель: <b><color=red>задержание ряда лиц</color></b>.<br><size=0>........................................................................</size><br><b><color=yellow>Персоналу Зоны<br>оказать полное содействие.</color></b><size=0> $pitch_1.05 .g2 $pitch_1 attention . internal security division is inside the facility . $pitch_0.9 arrest target personnel . $pitch_1 all site personnel cooperate with them immediately . $pitch_0.4 .g5 $pitch_0.3 .g5
> ```

---

### ⚙️ Комитет Дельта

#### ⚙️ Комитет Дельта

> [!error] Машинист
> **Запрос принят**
> ```text
> cassieadvanced custom false 9 <align=center><size=22><color=#4B5320><B>[Комитет Дельта]</B></color><br><color=white>Ваш запрос был <color=green>принят и одобрен</color>.<br><size=0>............</size><br>Ожидайте.<size=0> $pitch_0.8 your query accepted . standby . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```

> [!error] Машинист
> **Отказ в поддержке (Сил достаточно)**
> ```text
> cassieadvanced custom false 18 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=22><color=#4B5320><B>[Комитет Дельта]</B></color><br><color=white>Дополнительной поддержки <color=red><b>не будет.</b></color><br><size=0>........................................</size><br><color=white>Ваших сил <color=green>достаточно</color> для выполнения задачи.<br><size=0>........................................................................</size><br>Продолжайте работу имеющимся составом.</color><size=0> $pitch_0.75 .g3 .g2 . . .g5 .g3 . . $pitch_0.8 no more support . your force are enough for the task . $pitch_0.7 continue with your current personnel . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```

> [!error] Машинист
> **Отказ в поддержке (Нет наблюдателей)**
> ```text
> cassieadvanced custom false 20 <size=0>.</size> <size=0>.</size> <size=0>.</size> <align=center><size=22><color=#4B5320><B>[Комитет Дельта]</B></color><br><color=white>В поддержке <color=red><b>отказано</b></color>.<br><size=0>........................................</size><br>В данный момент все группы задействованы.<br><size=0>........................................................................</size><br>Свободные резервы отсутствуют. Полагайтесь на свои силы.<size=0> $pitch_0.9 .g3 .g2 . . .g4 $pitch_0.8 support denied . $pitch_0.8 current all unit are engaged . no available supply . $pitch_0.8 execute task with your current force . $pitch_0.3 .g5 $pitch_0.2 .g5
> ```
