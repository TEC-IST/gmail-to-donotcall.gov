javascript:(function(){
    //if we're in gmail
    if (location.href.includes('mail.google.com/mail/')) {

        //extract the phone number, date, time, and email body
        const emailTitleElement = document.getElementsByClassName('hP')[0];
        if (!emailTitleElement) {
            console.log('Unable to find email');
            return;
        }

        //phone number
        const emailTitleText = emailTitleElement.innerText;
        //filter to digits only
        const callerNumber = emailTitleText.replace(/\D/g, '');

        //date
        const dateElement = document.getElementsByClassName('g3')[0];
        const emailDate = dateElement.title.valueOf();
        //convert from "Mon DD, YYYY, HH:MM AM/PM" to "MM/DD/YYYY"
        const emailDateParts = emailDate.split(' ');

        //convert three letter month to numerical month
        const monthMap = {
            Jan: '01',
            Feb: '02',
            Mar: '03',
            Apr: '04',
            May: '05',
            Jun: '06',
            Jul: '07',
            Aug: '08',
            Sep: '09',
            Oct: '10',
            Nov: '11',
            Dec: '12'
        };
        const month = monthMap[emailDateParts[0]];
        const day = emailDateParts[1].slice(0, -1);
        const year = emailDateParts[2].slice(0, -1);
        const date = `${month}/${day}/${year}`;

        //time
        const hour = emailDateParts[3].split(':')[0];
        const minute = emailDateParts[3].split(':')[1].slice(0, 2).toString();
        const ampm = emailDateParts[3].slice(-2);
        //convert from 12 hour time to 24 hour time
        let hour24 = '';
        if (ampm === 'PM' && hour !== '12') {
            hour24 = (parseInt(hour) + 12).toString();
        } else if (ampm === 'AM' && hour === '12') {
            hour24 = '00';
        } else if (hour.length == 1) {
            hour24 = '0' + hour;
        }
                
        //email body (voicemail transcript)
        const emailBodyElement = document.getElementsByClassName('a3s')[0];
        const emailBodyText = emailBodyElement.innerText;
        //truncate "PLAY MESSAGE" onward
        const playMessageIndex = emailBodyText.indexOf('PLAY MESSAGE');
        const voicemailTranscript = emailBodyText.slice(0, playMessageIndex);
        console.log(voicemailTranscript);
        
        //copy the information to the clipboard as a JSON string so we can parse it for the donotcall.gov form
        const complaintInfo = JSON.stringify({callerNumber, date, hour24, minute, voicemailTranscript});
        console.log(complaintInfo);
        // Copy the information to the clipboard
        navigator.clipboard.writeText(complaintInfo).then(function() {
            window.open('https://www.donotcall.gov/report.html#step1', '_blank');
        });
    }

    //if we're on the donotcall.gov form step #1
    if (location.href.includes('www.donotcall.gov/report.html#step1')) {
        //fill in the form
        navigator.clipboard.readText().then(text => {
            const {callerNumber, date, hour24, minute, voicemailTranscript} = JSON.parse(text);
            document.getElementById('PhoneTextBox').value = '9999999999';
            document.getElementById('DateOfCallTextBox').value = date;
            document.getElementById('TimeOfCallDropDownList').value = hour24;
            document.getElementById('ddlMinutes').value = minute;

            document.getElementById('PrerecordMessageYESRadioButton').checked = true;
            document.getElementById('PhoneCallRadioButton').checked = true;

            document.getElementById('ddlSubjectMatter').value = '0';

            document.getElementById('StepOneContinueButton').click();

        });
    }

    //if we're on the donotcall.gov form step #2
    if (location.href.includes('www.donotcall.gov/report.html#step2')) {
        navigator.clipboard.readText().then(text => {
            const {callerNumber, date, hour24, minute, voicemailTranscript} = JSON.parse(text);

            document.getElementById('CallerPhoneNumberTextBox').value = callerNumber;
            document.getElementById('CallerNameTextBox').value = 'Unknown';

            document.getElementById('HaveBusinessNoRadioButton').checked = true;
            document.getElementById('StopCallingYesRadioButton').checked = true;

            document.getElementById('FirstNameTextBox').value = '';
            document.getElementById('LastNameTextBox').value = '';
            document.getElementById('StreetAddressTextBox').value = '';
            document.getElementById('CityTextBox').value = '';
            document.getElementById('StateDropDownList').value = '';
            document.getElementById('ZipCodeTextBox').value = '';

            document.getElementById('CommentTextBox').value = "Robocall voicemail transcript: " + voicemailTranscript;

            document.getElementById('StepTwoSubmitButton').click();
        });
    }
})();