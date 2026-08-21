<?php
/**
 * CTF challenge constants — Metadata Analysis
 */

define('CTF_FLAG', 'CTF{md_4n4lys1s_1s_k3y_t0_1nf0rm4t10n}');
define('CTF_FLAG_INNER', 'md_4n4lys1s_1s_k3y_t0_1nf0rm4t10n');
define('CTF_BASE64_PAYLOAD', 'bWRfNG40bHlzMXNfMXNfazN5X3QwXzFuZjBybTR0MTBu');

define('CTF_PARTICIPANT_USERNAME', 'participant');
define('CTF_PARTICIPANT_PASSWORD', 'upl04d_ch4ll3ng3_2026');

/**
 * 20 password candidates — only CTF_PARTICIPANT_PASSWORD is valid for login.
 */
function ctf_get_password_candidates(): array
{
    return [
        CTF_PARTICIPANT_PASSWORD,
        'upl04d_ch4ll3ng3_2025',
        'm3t4d4t4_k3y_2026',
        'admin_cs_lab_2026',
        'p4rt1c1p4nt_2026',
        'fl4g_hunt3r_99',
        'cyber_l4b_pass',
        'm3tadata_mast3r',
        'b4s364_d3c0d3!',
        'exiftool_r0cks',
        'card_k1ng_hack',
        's3cur1ty_n00b',
        'upload_vuln_x',
        'rce_pwned_2026',
        'ctf_w1nn3r!',
        'jack_queen_ace',
        'inf0rm4t10n!',
        'k3y_t0_th3_d00r',
        'l34rn_h4ck_gr0w',
        'd3c0d3_m3_plz',
    ];
}

function ctf_shuffled_password_list(): array
{
    $passwords = ctf_get_password_candidates();
    shuffle($passwords);
    return $passwords;
}
