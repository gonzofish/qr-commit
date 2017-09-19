'use strict';

(function() {
    const getCommits = (targetId) =>
        fetch('https://wt-f2290d7e27c4ca1d49ed5b8393d2fd1c-0.run.webtask.io/get_commits')
            .then((data) => data.json())
            .then((json) => json.commits.forEach((commit) => addCommit(commit, targetId)));

    const addCommit = (data, targetId) => {
        const target = document.getElementById(targetId);
        const commit = document.createElement('div');
        const details = document.createElement('table');
        const img = document.createElement('img');

        commit.classList.add('commit');
        details.appendChild(createDetailRow('Repo Owner', document.createTextNode(data.owner_name)));
        details.appendChild(createDetailRow('Repo', createLink(data.repo_url)));
        details.appendChild(createDetailRow('Pushed At', formatDate(data.pushed_at * 1000)));

        img.setAttribute('src', data.qr_code);

        commit.appendChild(img);
        commit.appendChild(details);
        target.appendChild(commit);
    };

    const createDetailRow = (label, data) => {
        const div = document.createElement('tr');

        div.classList.add('detail');
        div.appendChild(createLabel(label));
        div.appendChild(createDetail(data));

        return div;
    };
    const createLink = (link) => {
        const a = document.createElement('a');

        a.setAttribute('href', link);
        a.appendChild(document.createTextNode(link));

        return a;
    };
    const createLabel = (data) => createNode(document.createTextNode(data), 'th');
    const createDetail = (data) => createNode(data, 'td');
    const createNode = (data, tag) => {
        const text = document.createElement(tag);

        text.appendChild(data);

        return text;
    };

    const formatDate = (value) => {
        const date = new Date(value);
        const dateParts = [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())];
        const timeParts = [padNumber(date.getHours()), padNumber(date.getMinutes()), padNumber(date.getSeconds())];

        return document.createTextNode(dateParts.join('-') + ' ' + timeParts.join(':'));
    };

    const padNumber = (value) => ('0' + value).slice(-2);

    window.commits = Object.freeze({
        get: getCommits
    });
})();
